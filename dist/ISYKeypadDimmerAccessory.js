"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYKeypadDimmerAccessory = void 0;
const ISYDimmableAccessory_1 = require("./ISYDimmableAccessory");
require("./utils");
const plugin_1 = require("./plugin");
class ISYKeypadDimmerAccessory extends ISYDimmableAccessory_1.ISYDimmableAccessory {
    constructor(device, platform) {
        ``;
        super(device, platform);
        this.UUID = (0, plugin_1.generate)(`${device.isy.address}:${device.address}0`);
        this.category = 5 /* Categories.LIGHTBULB */;
        this.displayName = this.device.displayName;
        // this.category = Categories.Pro
    }
    // Handles the identify command
    // Handles request to set the current powerstate from homekit. Will ignore redundant commands.
    map(propertyName, propertyValue) {
        const o = super.map(propertyName, propertyValue);
        if (o) {
            o.characteristic = plugin_1.Characteristic.Brightness;
        }
        return o;
    }
    // Handles request to get the current on state
    // Handles request to get the current on state
    // Handles a request to get the current brightness level for dimmable lights.
    // Returns the set of services supported by this object.
    setupServices() {
        var _a;
        const s = super.setupServices();
        const self = this;
        // this.platformAccessory.removeService(this.primaryService);
        let index = 1;
        for (const child of this.device.children) {
            const serv = this.platformAccessory.getServiceByUUIDAndSubType(plugin_1.Service.StatelessProgrammableSwitch, child.address);
            const service = serv !== null && serv !== void 0 ? serv : this.platformAccessory.addService(new plugin_1.Service.StatelessProgrammableSwitch(child.displayName, child.address));
            index++;
            service.getCharacteristic(plugin_1.Characteristic.ServiceLabelIndex).updateValue(index);
            child.on('ControlTriggered', (controlName) => {
                switch (controlName) {
                    case 'DON':
                        self.logger('DON recieved. Mapping to SINGLE_PRESS.');
                        service.getCharacteristic(plugin_1.Characteristic.ProgrammableSwitchEvent).setValue(plugin_1.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                        break;
                    case 'DFON':
                        self.logger('DFON recieved. Mapping to DOUBLE_PRESS.');
                        service.getCharacteristic(plugin_1.Characteristic.ProgrammableSwitchEvent).setValue(plugin_1.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
                        break;
                    case 'BRT':
                        self.logger('BRT recieved. Mapping to LONG_PRESS.');
                        service.getCharacteristic(plugin_1.Characteristic.ProgrammableSwitchEvent).setValue(plugin_1.Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                        break;
                }
            });
        }
        const s1 = (_a = this.platformAccessory.getServiceByUUIDAndSubType(plugin_1.Service.StatelessProgrammableSwitch, this.device.address)) !== null && _a !== void 0 ? _a : this.platformAccessory.addService(new plugin_1.Service.StatelessProgrammableSwitch(this.device.displayName + ' (Button)', this.device.address));
        s1.getCharacteristic(plugin_1.Characteristic.ServiceLabelIndex).updateValue(1);
        this.device.on('ControlTriggered', (controlName) => {
            switch (controlName) {
                case 'DON':
                    s1.getCharacteristic(plugin_1.Characteristic.ProgrammableSwitchEvent).setValue(plugin_1.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                    break;
                case 'DFON':
                    s1.getCharacteristic(plugin_1.Characteristic.ProgrammableSwitchEvent).setValue(plugin_1.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
                    break;
                case 'BRT':
                    s1.getCharacteristic(plugin_1.Characteristic.ProgrammableSwitchEvent).setValue(plugin_1.Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                    break;
            }
        });
        this.platformAccessory.category = 5 /* Categories.LIGHTBULB */;
        this.primaryService.setPrimaryService(true);
        this.platformAccessory._associatedHAPAccessory.setPrimaryService(this.primaryService);
        // this.primaryService.getCharacteristic(Characteristic.Brightness).setProps({maxValue: this.devi;ce.OL});
    }
}
exports.ISYKeypadDimmerAccessory = ISYKeypadDimmerAccessory;
//# sourceMappingURL=ISYKeypadDimmerAccessory.js.map