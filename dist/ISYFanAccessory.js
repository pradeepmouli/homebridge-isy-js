"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYFanAccessory = void 0;
require("./ISYPlatform");
const isy_nodejs_1 = require("isy-nodejs");
const ISYDeviceAccessory_1 = require("./ISYDeviceAccessory");
const plugin_1 = require("./plugin");
const utils_1 = require("./utils");
class ISYFanAccessory extends ISYDeviceAccessory_1.ISYDeviceAccessory {
    constructor(device, platform) {
        super(device, platform);
        this.category = 3 /* Categories.FAN */;
    }
    map(propertyName, propertyValue) {
        if (propertyName === 'motor.ST') {
            return { characteristicValue: this.convertTo(propertyName, propertyValue), characteristic: plugin_1.Characteristic.RotationSpeed, service: this.fanService };
        }
        else if (propertyName === 'light.ST') {
            return { characteristicValue: propertyValue, characteristic: plugin_1.Characteristic.Brightness, service: this.lightService };
        }
    }
    convertTo(propertyName, value) {
        if (propertyName === 'motor.ST') {
            if (value === isy_nodejs_1.States.Fan.High) {
                return 99.9;
            }
            else if (value === isy_nodejs_1.States.Fan.Medium) {
                return 66.6;
            }
            else if (value === isy_nodejs_1.States.Fan.Low) {
                return 33.3;
            }
            return isy_nodejs_1.States.Off;
        }
        else {
            return super.convertTo(propertyName, value);
        }
    }
    convertFrom(characteristic, value) {
        if ((0, utils_1.isType)(characteristic, plugin_1.Characteristic.RotationSpeed)) {
            this.logger.debug('Characteristic is RotationSpeed');
            if (value > 66.6) {
                return isy_nodejs_1.States.Fan.High;
            }
            else if (value > 33.3) {
                return isy_nodejs_1.States.Fan.Medium;
            }
            else if (value > 0) {
                return isy_nodejs_1.States.Fan.Low;
            }
            return isy_nodejs_1.States.Off;
        }
        else {
            return super.convertFrom(characteristic, value);
        }
    }
    handlePropertyChange(propertyName, value, oldValue, formattedValue) {
        super.handlePropertyChange(propertyName, value, oldValue, formattedValue);
        this.fanService.getCharacteristic(plugin_1.Characteristic.On).updateValue(this.device.motor.isOn);
        if (this.lightService) {
            this.lightService.getCharacteristic(plugin_1.Characteristic.On).updateValue(this.device.light.isOn);
        }
    }
    // Mirrors change in the state of the underlying isj-js device object.
    // Returns the services supported by the fan device.
    setupServices() {
        super.setupServices();
        const fanService = this.platformAccessory.getOrAddService(plugin_1.Service.Fan);
        this.fanService = fanService;
        if (this.device.light) {
            const lightService = this.platformAccessory.getOrAddService(plugin_1.Service.Lightbulb);
            lightService.getCharacteristic(plugin_1.Characteristic.On).onSet(this.device.light.updateIsOn.bind(this.device.light)).onGet((() => this.device.light.isOn).bind(this));
            lightService.getCharacteristic(plugin_1.Characteristic.Brightness).onSet(this.device.light.updateBrightnessLevel.bind(this.device.light)).onGet((() => this.device.light.brightnessLevel).bind(this));
            this.lightService = lightService;
        }
        fanService.getCharacteristic(plugin_1.Characteristic.RotationSpeed).onSet(this.device.motor.updateFanSpeed.bind(this.device.motor), this.convertFrom.bind(this)).onGet((() => this.convertTo('motor.ST', this.device.motor.fanSpeed)).bind(this)).setProps({ minStep: 33.3 });
        fanService.getCharacteristic(plugin_1.Characteristic.On).onSet(this.device.motor.updateIsOn.bind(this.device.motor)).onGet((() => this.device.motor.isOn).bind(this));
        fanService.isPrimaryService = true;
        this.primaryService = fanService;
    }
}
exports.ISYFanAccessory = ISYFanAccessory;
//# sourceMappingURL=ISYFanAccessory.js.map