"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYMotionSensorAccessory = void 0;
const ISYDeviceAccessory_1 = require("./ISYDeviceAccessory");
const plugin_1 = require("./plugin");
const utils_1 = require("./utils");
class ISYMotionSensorAccessory extends ISYDeviceAccessory_1.ISYDeviceAccessory {
    get motionSensorService() {
        var _a;
        return (_a = this.platformAccessory) === null || _a === void 0 ? void 0 : _a.getOrAddService(plugin_1.Service.MotionSensor);
    }
    get lightSensorService() {
        var _a;
        return (_a = this.platformAccessory) === null || _a === void 0 ? void 0 : _a.getOrAddService(plugin_1.Service.LightSensor);
    }
    get batteryLevelService() {
        var _a;
        return (_a = this.platformAccessory) === null || _a === void 0 ? void 0 : _a.getOrAddService(plugin_1.Service.BatteryService);
    }
    get temperatureSensorService() {
        var _a;
        return (_a = this.platformAccessory) === null || _a === void 0 ? void 0 : _a.getOrAddService(plugin_1.Service.TemperatureSensor);
    }
    map(propertyName, propertyValue) {
        // let o = super(propertyValue,propertyValue);
        switch (propertyName) {
            case 'CLITEMP':
                return { characteristicValue: (0, utils_1.toCelsius)(propertyValue), characteristic: plugin_1.Characteristic.CurrentTemperature, service: this.temperatureSensorService };
            case 'BATLVL':
                return { characteristicValue: propertyValue, characteristic: plugin_1.Characteristic.BatteryLevel, service: this.batteryLevelService };
            case 'ST':
                return { characteristicValue: propertyValue, characteristic: plugin_1.Characteristic.Active, service: this.informationService };
            case 'LUMIN':
                return { characteristicValue: propertyValue, characteristic: plugin_1.Characteristic.CurrentTemperature, service: this.lightSensorService };
            case 'motionDetected':
                return { characteristicValue: propertyValue, characteristic: plugin_1.Characteristic.MotionDetected, service: this.motionSensorService };
        }
        return null;
    }
    handleControlTrigger(controlName) {
        super.handleControlTrigger(controlName);
        if (controlName === 'DON') {
            this.updateCharacteristicValue(true, plugin_1.Characteristic.MotionDetected, this.motionSensorService);
        }
        else if (controlName === 'DOF') {
            this.updateCharacteristicValue(false, plugin_1.Characteristic.MotionDetected, this.motionSensorService);
        }
    }
    setupServices() {
        super.setupServices();
        this.primaryService = this.motionSensorService;
        this.motionSensorService.getCharacteristic(plugin_1.Characteristic.MotionDetected).onGet(() => this.device.isMotionDetected);
        this.temperatureSensorService.getCharacteristic(plugin_1.Characteristic.CurrentTemperature).onGet(() => (0, utils_1.toCelsius)(this.device.CLITEMP));
        this.batteryLevelService.getCharacteristic(plugin_1.Characteristic.BatteryLevel).onGet(() => this.device.BATLVL);
        this.lightSensorService.getCharacteristic(plugin_1.Characteristic.CurrentAmbientLightLevel).onGet(() => this.device.LUMIN);
    }
}
exports.ISYMotionSensorAccessory = ISYMotionSensorAccessory;
//# sourceMappingURL=ISYMotionSensorAccessory.js.map