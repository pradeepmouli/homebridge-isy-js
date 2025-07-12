"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYLockAccessory = void 0;
const ISYDeviceAccessory_1 = require("./ISYDeviceAccessory");
const plugin_1 = require("./plugin");
class ISYLockAccessory extends ISYDeviceAccessory_1.ISYDeviceAccessory {
    // Handles an identify request
    // Handles a set to the target lock state. Will ignore redundant commands.
    setTargetLockState(lockState, callback) {
        this.info(`Sending command to set lock state to: ${lockState}`);
        if (lockState !== this.getDeviceCurrentStateAsHK()) {
            const targetLockValue = lockState === 0 ? false : true;
            this.device.sendLockCommand(targetLockValue, callback);
        }
        else {
            callback();
        }
    }
    // Translates underlying lock state into the corresponding homekit state
    getDeviceCurrentStateAsHK() {
        return this.device.getCurrentLockState() ? 1 : 0;
    }
    // Handles request to get the current lock state for homekit
    getLockCurrentState(callback) {
        callback(null, this.getDeviceCurrentStateAsHK());
    }
    // Handles request to get the target lock state for homekit
    getTargetLockState(callback) {
        this.getLockCurrentState(callback);
    }
    // Mirrors change in the state of the underlying isy-nodejs device object.
    handlePropertyChange(propertyName, value, oldValue, formattedValue) {
        this.lockService.updateCharacteristic(plugin_1.Characteristic.LockTargetState, this.getDeviceCurrentStateAsHK());
        this.lockService.updateCharacteristic(plugin_1.Characteristic.LockCurrentState, this.getDeviceCurrentStateAsHK());
    }
    // Returns the set of services supported by this object.
    setupServices() {
        super.setupServices();
        const lockMechanismService = this.platformAccessory.getOrAddService(plugin_1.Service.LockMechanism);
        this.lockService = lockMechanismService;
        lockMechanismService.getCharacteristic(plugin_1.Characteristic.LockTargetState).on("set" /* CharacteristicEventTypes.SET */, this.setTargetLockState.bind(this));
        lockMechanismService.getCharacteristic(plugin_1.Characteristic.LockCurrentState).on("get" /* CharacteristicEventTypes.GET */, this.getLockCurrentState.bind(this));
    }
}
exports.ISYLockAccessory = ISYLockAccessory;
//# sourceMappingURL=ISYLockAccessory.js.map