"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYAccessory = exports.AccessoryContext = void 0;
const isy_nodejs_1 = require("isy-nodejs");
const plugin_1 = require("./plugin");
class AccessoryContext {
}
exports.AccessoryContext = AccessoryContext;
class ISYAccessory {
    // tslint:disable-next-line: ban-types
    bind(func) {
        return func.bind(this.device);
    }
    constructor(device, platform) {
        const s = (0, plugin_1.generate)(`${device.isy.address}:${device.address}1`);
        this.UUID = s;
        this.name = device.name;
        this.displayName = device.displayName;
        this.logger = platform.log;
        this.device = device;
        this.address = device.address;
        this.context = new AccessoryContext();
        this.context.address = this.address;
        this.device.on('PropertyChanged', this.handlePropertyChange.bind(this));
        this.device.on('ControlTriggered', this.handleControlTrigger.bind(this));
    }
    map(propertyName, propertyValue) {
        const outputVal = this.convert(propertyValue, propertyName);
        if (propertyName === 'ST') {
            return { characteristicValue: outputVal, characteristic: plugin_1.Characteristic.On, service: this.primaryService };
        }
        return { characteristicValue: outputVal, service: this.primaryService };
    }
    handleControlTrigger(controlName) {
        this.logger.info(`${isy_nodejs_1.Controls[controlName].label} triggered.`);
    }
    configure(accessory) {
        if (accessory) {
            if (!accessory.getOrAddService) {
                accessory.getOrAddService = plugin_1.PlatformAccessory.prototype.getOrAddService.bind(accessory);
            }
            accessory.displayName = this.displayName;
            this.platformAccessory = accessory;
            this.platformAccessory.context.address = this.address;
            this.logger.info('Configuring linked platform accessory');
        }
        else {
            this.platformAccessory = new plugin_1.PlatformAccessory(this.displayName, this.UUID, this.category);
            this.platformAccessory.context.address = this.address;
            this.logger.info('New platform accessory needed');
        }
        this.setupServices();
        this.primaryService.isPrimaryService = true;
        this.platformAccessory.on('identify', () => this.identify.bind(this));
    }
    setupServices() {
        var _a, _b, _c, _d;
        this.informationService = this.platformAccessory.getOrAddService(plugin_1.Service.AccessoryInformation);
        this.informationService
            .getCharacteristic(plugin_1.Characteristic.Manufacturer).updateValue((_a = isy_nodejs_1.Family[this.device.family]) !== null && _a !== void 0 ? _a : 'Universal Devices, Inc.');
        this.informationService.getCharacteristic(plugin_1.Characteristic.Model).updateValue((_b = this.device.productName) !== null && _b !== void 0 ? _b : this.device.name);
        this.informationService.getCharacteristic(plugin_1.Characteristic.SerialNumber).updateValue((_c = this.device.modelNumber) !== null && _c !== void 0 ? _c : this.device.address);
        this.informationService.getCharacteristic(plugin_1.Characteristic.FirmwareRevision).updateValue((_d = this.device.version) !== null && _d !== void 0 ? _d : '1.0');
        // .setCharacteristic(Characteristic.ProductData, this.device.address);
    }
    handlePropertyChange(propertyName, value, oldValue, formattedValue) {
        const name = propertyName in isy_nodejs_1.Controls ? isy_nodejs_1.Controls[propertyName].label : propertyName;
        this.logger.info(`Incoming update to ${name}. New Value: ${value} (${formattedValue}) Old Value: ${oldValue}`);
        const m = this.map(propertyName, value);
        if (m.characteristic) {
            this.logger.debug('Property mapped to:', m.service.displayName, m.characteristic.name, `(${m.characteristicValue})`);
            this.updateCharacteristicValue(m.characteristicValue, m.characteristic, m.service);
        }
        else {
            this.logger.info('Property not mapped.');
        }
    }
    updateCharacteristicValue(value, characteristic, service) {
        service.updateCharacteristic(characteristic, value);
    }
    convert(value, property) {
        if (property instanceof plugin_1.Characteristic) {
            return this.convertFrom(property, value);
        }
        else {
            return this.convertTo(property, value);
        }
    }
    convertTo(propertyName, value) {
        return value;
    }
    convertFrom(characteristic, value) {
        return value;
    }
    identify() {
        // Do the identify action
    }
}
exports.ISYAccessory = ISYAccessory;
//# sourceMappingURL=ISYAccessory.js.map