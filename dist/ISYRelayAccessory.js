"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYRelayAccessory = void 0;
const ISYDeviceAccessory_1 = require("./ISYDeviceAccessory");
const plugin_1 = require("./plugin");
require("./utils");
class ISYRelayAccessory extends ISYDeviceAccessory_1.ISYDeviceAccessory {
    constructor(device, platform) {
        super(device, platform);
        this.category = 8 /* Categories.SWITCH */;
        this.dimmable = device.isDimmable || false;
    }
    map(propertyName, propertyValue) {
        const o = super.map(propertyName, propertyValue);
        if (propertyName === 'ST') {
            o.characteristic = plugin_1.Characteristic.On;
            o.service = this.primaryService;
            o.characteristicValue = this.device.isOn;
        }
        return o;
    }
    // Mirrors change in the state of the underlying isj-js device object.
    // public handleExternalChange(propertyName: string, value: any, formattedValue: string) {
    // super.handleExternalChange(propertyName, value, formattedValue);
    // l
    // this.primaryService.getCharacteristic(Characteristic.On).updateValue(this.device.isOn);
    // }
    // Returns the set of services supported by this object.
    setupServices() {
        super.setupServices();
        this.primaryService = this.platformAccessory.getOrAddService(plugin_1.Service.Switch);
        this.primaryService.getCharacteristic(plugin_1.Characteristic.On).onGet(() => this.device.isOn).onSet(this.bind(this.device.updateIsOn));
    }
}
exports.ISYRelayAccessory = ISYRelayAccessory;
//# sourceMappingURL=ISYRelayAccessory.js.map