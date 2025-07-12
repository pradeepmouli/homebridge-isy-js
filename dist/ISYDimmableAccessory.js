"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYDimmableAccessory = void 0;
const ISYRelayAccessory_1 = require("./ISYRelayAccessory");
const plugin_1 = require("./plugin");
require("./utils");
class ISYDimmableAccessory extends ISYRelayAccessory_1.ISYRelayAccessory {
    constructor(device, platform) {
        super(device, platform);
        this.category = 5 /* Categories.LIGHTBULB */;
    }
    // Handles the identify command
    map(propertyName, propertyValue) {
        const o = super.map(propertyName, propertyValue);
        if (o) {
            o.characteristic = plugin_1.Characteristic.Brightness;
            o.characteristicValue = propertyValue;
        }
        return o;
    }
    // Mirrors change in the state of the underlying isj-js device object.
    handlePropertyChange(propertyName, value, oldValue, formattedValue) {
        this.primaryService.updateCharacteristic(plugin_1.Characteristic.On, this.device.isOn);
        super.handlePropertyChange(propertyName, value, oldValue, formattedValue);
    }
    // Returns the set of services supported by this object.
    setupServices() {
        const s = super.setupServices();
        this.platformAccessory.removeService(this.primaryService);
        this.primaryService = this.platformAccessory.getOrAddService(plugin_1.Service.Lightbulb);
        this.primaryService.getCharacteristic(plugin_1.Characteristic.On).onSet(this.bind(this.device.updateIsOn));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.On).onGet(() => this.device.isOn);
        this.primaryService.getCharacteristic(plugin_1.Characteristic.Brightness).onGet(() => this.device.brightnessLevel);
        this.primaryService.getCharacteristic(plugin_1.Characteristic.Brightness).onSet(this.bind(this.device.updateBrightnessLevel)).setProps({});
        // this.primaryService.getCharacteristic(Characteristic.Brightness).setProps({maxValue: this.device.OL});
    }
}
exports.ISYDimmableAccessory = ISYDimmableAccessory;
//# sourceMappingURL=ISYDimmableAccessory.js.map