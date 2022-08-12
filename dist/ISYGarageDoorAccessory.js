"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYGarageDoorAccessory = void 0;
const ISYAccessory_1 = require("./ISYAccessory");
const plugin_1 = require("./plugin");
class ISYGarageDoorAccessory extends ISYAccessory_1.ISYAccessory {
    constructor(sensorDevice, relayDevice, name, timeToOpen, alternate, platform) {
        super(sensorDevice, platform);
        this.timeToOpen = timeToOpen;
        this.relayDevice = relayDevice;
        this.alternate = alternate === undefined ? false : alternate;
        if (this.getSensorState()) {
            this.logger.info(`GARAGE: ${this.name} Initial set during startup the sensor is open so defaulting states to open`);
            this.targetGarageState = plugin_1.Characteristic.TargetDoorState.OPEN;
            this.currentGarageState = plugin_1.Characteristic.CurrentDoorState.OPEN;
        }
        else {
            this.logger.info(`GARAGE: ${this.name} Initial set during startup the sensor is closed so defaulting states to closed`);
            this.targetGarageState = plugin_1.Characteristic.TargetDoorState.CLOSED;
            this.currentGarageState = plugin_1.Characteristic.CurrentDoorState.CLOSED;
        }
    }
    getSensorState() {
        let openState = this.alternate ? 0 : 100;
        return this.device.ST == openState;
    }
    // Handles an identify request
    sendGarageDoorCommand(callback) {
        this.relayDevice.sendCommand('DON').then(() => {
            setTimeout(() => {
                this.relayDevice.sendCommand('DOF').then(() => {
                    callback();
                });
            }, 2000);
        });
    }
    // Handles a set to the target lock state. Will ignore redundant commands.
    setTargetDoorState(targetState, callback) {
        const that = this;
        if (targetState === this.targetGarageState) {
            this.logger.info('GARAGE: Ignoring redundant set of target state');
            callback();
            return;
        }
        this.targetGarageState = targetState;
        if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.OPEN) {
            if (targetState === plugin_1.Characteristic.TargetDoorState.CLOSED) {
                this.logger.info(`GARAGE: Current state is open and target is closed. Changing state to closing and sending command`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.CLOSING);
                this.sendGarageDoorCommand(callback);
            }
        }
        else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.CLOSED) {
            if (targetState === plugin_1.Characteristic.TargetDoorState.OPEN) {
                this.logger.info(`GARAGE: Current state is closed and target is open. Changing state to opening and sending command`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.OPENING);
                this.sendGarageDoorCommand(callback);
                setTimeout(that.completeOpen.bind(that), that.timeToOpen);
                return;
            }
        }
        else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.OPENING) {
            if (targetState === plugin_1.Characteristic.TargetDoorState.CLOSED) {
                this.logger.info(`GARAGE: ${this.device.name} Current state is opening and target is closed. Sending command and changing state to closing`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.CLOSING);
                this.sendGarageDoorCommand(() => setTimeout(() => that.sendGarageDoorCommand(callback), 3000));
                return;
            }
        }
        else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.CLOSING) {
            if (targetState === plugin_1.Characteristic.TargetDoorState.OPEN) {
                this.logger.info(`GARAGE: ${this.device.name} Current state is closing and target is open. Sending command and setting timeout to complete`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.OPENING);
                this.sendGarageDoorCommand(() => {
                    setTimeout(() => that.sendGarageDoorCommand(callback), 3000);
                    setTimeout(that.completeOpen.bind(that), that.timeToOpen);
                });
            }
        }
    }
    // Handles request to get the current lock state for homekit
    getCurrentDoorState(callback) {
        callback(null, this.currentGarageState);
    }
    setCurrentDoorState(newState, callback) {
        this.currentGarageState = newState;
        callback();
    }
    // Handles request to get the target lock state for homekit
    getTargetDoorState(callback) {
        callback(null, this.targetGarageState);
    }
    completeOpen() {
        if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.OPENING) {
            this.logger.info('Current door has been opening long enough, marking open');
            this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.OPEN);
        }
        else {
            this.logger.info('Opening aborted so not setting opened state automatically');
        }
    }
    // Mirrors change in the state of the underlying isj-js device object.
    handlePropertyChange(propertyName, value, oldValue, formattedValue) {
        super.handlePropertyChange(propertyName, value, oldValue, formattedValue);
        if (this.getSensorState()) {
            if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.OPEN) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is open and now sensor matches. No action to take`);
            }
            else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.CLOSED) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is closed and now sensor says open. Setting state to opening`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.OPENING);
                this.targetGarageState = plugin_1.Characteristic.TargetDoorState.OPEN;
                this.primaryService.setCharacteristic(plugin_1.Characteristic.TargetDoorState, plugin_1.Characteristic.CurrentDoorState.OPEN);
                setTimeout(this.completeOpen.bind(this), this.timeToOpen);
            }
            else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.OPENING) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is opening and now sensor says open. waiting for timeout`);
            }
            else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.CLOSING) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is closing and sensor says opened, waiting for sensor`);
            }
        }
        else {
            if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.OPEN) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is open and now sensor shows closed. Setting current state to closed`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.CLOSED);
                this.targetGarageState = plugin_1.Characteristic.TargetDoorState.CLOSED;
                this.primaryService.setCharacteristic(plugin_1.Characteristic.TargetDoorState, plugin_1.Characteristic.TargetDoorState.CLOSED);
            }
            else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.CLOSED) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is closed and now sensor shows closed. No action to take`);
            }
            else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.OPENING) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is opening and now sensor shows closed. Setting current state to closed`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.CLOSED);
                this.targetGarageState = plugin_1.Characteristic.TargetDoorState.CLOSED;
                this.primaryService.setCharacteristic(plugin_1.Characteristic.TargetDoorState, plugin_1.Characteristic.TargetDoorState.CLOSED);
            }
            else if (this.currentGarageState === plugin_1.Characteristic.CurrentDoorState.CLOSING) {
                this.logger.info(`GARAGE:  ${this.device.name} Current state of door is closing and now sensor shows closed. Setting current state to closed`);
                this.primaryService.setCharacteristic(plugin_1.Characteristic.CurrentDoorState, plugin_1.Characteristic.CurrentDoorState.CLOSED);
                this.targetGarageState = plugin_1.Characteristic.TargetDoorState.CLOSED;
                this.primaryService.setCharacteristic(plugin_1.Characteristic.TargetDoorState, plugin_1.Characteristic.TargetDoorState.CLOSED);
            }
        }
    }
    getObstructionState(callback) {
        callback(null, false);
    }
    // Returns the set of services supported by this object.
    setupServices() {
        super.setupServices();
        const primaryService = this.platformAccessory.getOrAddService(plugin_1.Service.GarageDoorOpener);
        this.primaryService = primaryService;
        primaryService.getCharacteristic(plugin_1.Characteristic.TargetDoorState).on("set" /* CharacteristicEventTypes.SET */, this.setTargetDoorState.bind(this));
        primaryService.getCharacteristic(plugin_1.Characteristic.TargetDoorState).on("get" /* CharacteristicEventTypes.GET */, this.getTargetDoorState.bind(this));
        primaryService.getCharacteristic(plugin_1.Characteristic.CurrentDoorState).on("get" /* CharacteristicEventTypes.GET */, this.getCurrentDoorState.bind(this));
        primaryService.getCharacteristic(plugin_1.Characteristic.CurrentDoorState).on("set" /* CharacteristicEventTypes.SET */, this.setCurrentDoorState.bind(this));
        primaryService.getCharacteristic(plugin_1.Characteristic.ObstructionDetected).on("get" /* CharacteristicEventTypes.GET */, this.getObstructionState.bind(this));
    }
}
exports.ISYGarageDoorAccessory = ISYGarageDoorAccessory;
//# sourceMappingURL=ISYGarageDoorAccessory.js.map