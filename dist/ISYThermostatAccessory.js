"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYThermostatAccessory = void 0;
require("./utils");
const isy_nodejs_1 = require("isy-nodejs");
const ISYDeviceAccessory_1 = require("./ISYDeviceAccessory");
const plugin_1 = require("./plugin");
// import { Service } from 'homebridge/node_modules/hap-nodejs/dist/lib/Service';
// import { Characteristic } from 'homebridge/node_modules/hap-nodejs/dist/lib/Characteristic';
class ISYThermostatAccessory extends ISYDeviceAccessory_1.ISYDeviceAccessory {
    toCelsius(temp) {
        return ((temp - 32.0) * 5.0) / 9.0;
    }
    toFahrenheit(temp) {
        return Math.round((temp * 9.0) / 5.0 + 32.0);
    }
    getCurrentTemperature(callback) {
        this.logger.info(`Getting Current Temperature - Device says: ${this.device.currentTemperature} says: ${this.toCelsius(this.device.currentTemperature)}`);
        callback(null, this.toCelsius(this.device.currentTemperature));
    }
    getCoolSetPoint(callback) {
        this.logger.info(`Getting Cooling Set Point - Device says: ${this.device.coolSetPoint} translation says: ${this.toCelsius(this.device.coolSetPoint)}`);
        callback(null, this.toCelsius(this.device.coolSetPoint));
    }
    getHeatSetPoint(callback) {
        this.logger.info(`Getting Heating Set Point - Device says: ${this.device.heatSetPoint} translation says: ${this.toCelsius(this.device.heatSetPoint)}`);
        callback(null, this.toCelsius(this.device.heatSetPoint));
    }
    getMode(callback) {
        this.logger.info(`Getting Heating Cooling Mode - Device says: ${this.device.mode}`);
        callback(null, this.device.mode);
    }
    getOperatingMode(callback) {
        this.logger.info(`Getting Heating Cooling State - Device says: ${this.device.operatingMode}`);
        callback(null, this.device.operatingMode);
    }
    getFanMode(callback) {
        this.logger.info(`Getting Fan State - Device says: ${this.device.fanMode}`);
        callback(null, this.device.fanMode);
    }
    getHumidity(callback) {
        this.logger.info(`Getting Current Rel. Humidity - Device says: ${this.device.humidity}`);
        callback(null, this.device.humidity);
    }
    // Mirrors change in the state of the underlying isy-nodejs device object.
    handlePropertyChange(propertyName, value, oldValue, formattedValue) {
        super.handlePropertyChange(propertyName, value, oldValue, formattedValue);
        switch (propertyName) {
            case isy_nodejs_1.Props.Climate.Temperature:
                this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentTemperature).updateValue(this.toCelsius(this.device.currentTemperature));
                break;
            case isy_nodejs_1.Props.Climate.CoolSetPoint:
                this.primaryService.getCharacteristic(plugin_1.Characteristic.CoolingThresholdTemperature).updateValue(this.toCelsius(this.device.coolSetPoint));
                break;
            case isy_nodejs_1.Props.Climate.HeatSetPoint:
                this.primaryService.getCharacteristic(plugin_1.Characteristic.CoolingThresholdTemperature).updateValue(this.toCelsius(this.device.heatSetPoint));
                break;
            case isy_nodejs_1.Props.Climate.OperatingMode:
                this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentHeatingCoolingState).updateValue(this.device.operatingMode);
                break;
            case isy_nodejs_1.Props.Climate.Mode:
                this.primaryService.getCharacteristic(plugin_1.Characteristic.TargetHeatingCoolingState).updateValue(this.device.mode);
                break;
            case isy_nodejs_1.Props.Climate.FanMode:
                this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentFanState).updateValue(this.device.fanMode);
                break;
            case isy_nodejs_1.Props.Climate.Humidity:
                this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentRelativeHumidity).updateValue(this.device.humidity);
                break;
            default:
                break;
        }
    }
    setupServices() {
        super.setupServices();
        this.primaryService = this.addService(plugin_1.Service.Thermostat);
        // primaryService.getCharacteristic(Characteristic.TargetTemperature).on("get", this.getTargetTemperature.bind(this));
        // primaryService.getCharacteristic(Characteristic.TargetTemperature).on("set", this.setTargetTemperature.bind(this));
        this.primaryService.setCharacteristic(plugin_1.Characteristic.TemperatureDisplayUnits, 1);
        this.primaryService.addCharacteristic(plugin_1.Characteristic.CurrentFanState);
        this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentFanState).on("get" /* CharacteristicEventTypes.GET */, (f) => this.getFanMode(f));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentTemperature).on("get" /* CharacteristicEventTypes.GET */, this.getCurrentTemperature.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.CoolingThresholdTemperature).on("get" /* CharacteristicEventTypes.GET */, this.getCoolSetPoint.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.CoolingThresholdTemperature).on("set" /* CharacteristicEventTypes.SET */, this.setCoolSetPoint.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.HeatingThresholdTemperature).on("get" /* CharacteristicEventTypes.GET */, this.getHeatSetPoint.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.HeatingThresholdTemperature).on("set" /* CharacteristicEventTypes.SET */, this.setHeatSetPoint.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentHeatingCoolingState).on("get" /* CharacteristicEventTypes.GET */, this.getOperatingMode.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.TargetHeatingCoolingState).on("get" /* CharacteristicEventTypes.GET */, this.getMode.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.TargetHeatingCoolingState).on("set" /* CharacteristicEventTypes.SET */, this.setHeatingCoolingMode.bind(this));
        this.primaryService.getCharacteristic(plugin_1.Characteristic.CurrentRelativeHumidity).on("get" /* CharacteristicEventTypes.GET */, this.getHumidity.bind(this));
        // primaryService
        //   .getCharacteristic(Characteristic.RotationSpeed)
        //   .on(CharacteristicEventTypes.SET, this.setThermostatRotationSpeed.bind(this));
    }
    setCoolSetPoint(temp, callback) {
        this.logger.info(`Sending command to set cool set point (pre-translate) to: ${temp}`);
        const newSetPoint = this.toFahrenheit(temp);
        this.logger.info(`Sending command to set cool set point to: ${newSetPoint}`);
        if (Math.abs(newSetPoint - this.device.coolSetPoint) >= 1) {
            this.device.updateCoolSetPoint(newSetPoint).handleWith(callback);
        }
        else {
            this.logger.info(`Command does not change actual set point`);
            callback();
        }
    }
    setHeatSetPoint(temp, callback) {
        this.logger.info(`Sending command to set heat set point (pre-translate) to: ${temp}`);
        const newSetPoint = this.toFahrenheit(temp);
        this.logger.info(`Sending command to set heat set point to: ${newSetPoint}`);
        if (Math.abs(newSetPoint - this.device.heatSetPoint) >= 1) {
            this.device
                .updateHeatSetPoint(newSetPoint).handleWith(callback);
        }
        else {
            this.logger.info(`Command does not change actual set point`);
            callback();
        }
    }
    setHeatingCoolingMode(mode, callback) {
        this.logger.info(`Sending command to set heating/cooling mode (pre-translate) to: ${mode}`);
        // this.logger.info("THERM: " + this.device.name + " Sending command to set cool set point to: " + newSetPoint);
        if (mode !== this.device.mode) {
            this.device
                .updateMode(mode).handleWith(callback);
        }
        else {
            this.logger.info(`Command does not change actual mode`);
            callback();
        }
    }
}
exports.ISYThermostatAccessory = ISYThermostatAccessory;
//# sourceMappingURL=ISYThermostatAccessory.js.map