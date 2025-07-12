"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYSceneAccessory = void 0;
require("./utils");
const ISYAccessory_1 = require("./ISYAccessory");
const plugin_1 = require("./plugin");
const utils_1 = require("./utils");
class ISYSceneAccessory extends ISYAccessory_1.ISYAccessory {
    constructor(scene, platform) {
        super(scene, platform);
        this.category = 5 /* Categories.LIGHTBULB */;
        this.dimmable = scene.isDimmable;
        // this.logger = function(msg) {log("Scene Accessory: " + scene.name + ": " + msg); };
    }
    // Handles the identify command
    identify() {
        const that = this;
    }
    // Handles request to set the current powerstate from homekit. Will ignore redundant commands.
    // Mirrors change in the state of the underlying isj-js device object.
    handlePropertyChange(propertyName, value, oldValue, formattedValue) {
        this.primaryService.getCharacteristic(plugin_1.Characteristic.On).updateValue(this.device.isOn);
        if (this.dimmable) {
            this.primaryService.getCharacteristic(plugin_1.Characteristic.Brightness).updateValue(this.device.brightnessLevel);
        }
    }
    // Handles request to get the current on state
    // Returns the set of services supported by this object.
    setupServices() {
        super.setupServices();
        if (this.dimmable) {
            this.primaryService = this.platformAccessory.getOrAddService(plugin_1.Service.Lightbulb);
            (0, utils_1.onSet)(this.primaryService.getCharacteristic(plugin_1.Characteristic.Brightness), this.bind(this.device.updateBrightnessLevel)).onGet(() => this.device.brightnessLevel);
        }
        else {
            this.primaryService = this.platformAccessory.getOrAddService(plugin_1.Service.Switch);
        }
        this.primaryService
            .getCharacteristic(plugin_1.Characteristic.On)
            .onGet(() => this.device.isOn).onSet(this.bind(this.device.updateIsOn));
    }
}
exports.ISYSceneAccessory = ISYSceneAccessory;
//# sourceMappingURL=ISYSceneAccessory.js.map