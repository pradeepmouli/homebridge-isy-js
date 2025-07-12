import './ISYPlatform';

import { Categories, WithUUID } from 'hap-nodejs';
import { Fan, Lightbulb } from 'hap-nodejs/dist/lib/gen/HomeKit';
import * as HB from 'homebridge';
import { InsteonFanDevice, States } from 'isy-nodejs';
import { ISYDeviceAccessory } from './ISYDeviceAccessory';
import { ISYPlatform } from './ISYPlatform';
import { Characteristic, Service } from './plugin';
import { isType } from './utils';



type t = typeof Characteristic.RotationSpeed;
export class ISYFanAccessory extends ISYDeviceAccessory<InsteonFanDevice, Categories.FAN> {
	public fanService!: Fan;
	public lightService?: Lightbulb;
	constructor(device: InsteonFanDevice, platform: ISYPlatform) {
		super(device, platform);
		this.category = Categories.FAN;

	}

	public map(propertyName: string, propertyValue: any) {

		if (propertyName === 'motor.ST') {

			return { characteristicValue: this.convertTo(propertyName, propertyValue), characteristic: Characteristic.RotationSpeed, service: this.fanService };
		} else if (propertyName === 'light.ST') {
			return { characteristicValue: propertyValue, characteristic: Characteristic.Brightness, service: this.lightService };
		}

	}

	public convertTo(propertyName, value: any) {
		if (propertyName === 'motor.ST') {
			if (value === States.Fan.High) {
				return 99.9;
			} else if (value === States.Fan.Medium) {
				return 66.6;
			} else if (value === States.Fan.Low) {
				return 33.3;
			}
			return States.Off;
		} else {
			return super.convertTo(propertyName, value);
		}

	}

	public convertFrom(characteristic: HB.Characteristic, value: HB.CharacteristicValue) {
		if (isType(characteristic,Characteristic.RotationSpeed)) {
			this.logger.debug('Characteristic is RotationSpeed');

			const numValue = Number(value);
			if (numValue > 66.6) {
				return States.Fan.High;
			} else if (numValue > 33.3) {
				return States.Fan.Medium;
			} else if (numValue > 0) {
				return States.Fan.Low;
			}
			return States.Off;
		} else {

			return super.convertFrom(characteristic as unknown as HB.Characteristic, value);
		}
	}
	public handlePropertyChange(propertyName: string, value: any, oldValue: any, formattedValue: any) {
		super.handlePropertyChange(propertyName, value, oldValue, formattedValue);
		this.fanService.getCharacteristic(Characteristic.On).updateValue(this.device.motor.isOn);
		if (this.lightService) {
			this.lightService.getCharacteristic(Characteristic.On).updateValue(this.device.light.isOn);
		}
	}

	// Mirrors change in the state of the underlying isj-js device object.

	// Returns the services supported by the fan device.
	public setupServices() {
		super.setupServices();
		const fanService = this.platformAccessory.getOrAddService(Service.Fan);
		this.fanService = fanService;
		if (this.device.light) {
			const lightService = this.platformAccessory.getOrAddService(Service.Lightbulb);
			lightService.getCharacteristic(Characteristic.On).onSet(this.device.light.updateIsOn.bind(this.device.light)).onGet((() => this.device.light.isOn).bind(this));
			lightService.getCharacteristic(Characteristic.Brightness).onSet(this.device.light.updateBrightnessLevel.bind(this.device.light)).onGet((() => this.device.light.brightnessLevel).bind(this));
			this.lightService = lightService;
		}

		fanService.getCharacteristic(Characteristic.RotationSpeed).onSet(this.device.motor.updateFanSpeed.bind(this.device.motor), this.convertFrom.bind(this)).onGet((() => this.convertTo('motor.ST', this.device.motor.fanSpeed)).bind(this)).setProps({minStep: 33.3});
		fanService.getCharacteristic(Characteristic.On).onSet(this.device.motor.updateIsOn.bind(this.device.motor)).onGet((() => this.device.motor.isOn).bind(this));

		fanService.isPrimaryService = true;
		this.primaryService = fanService;

	}
}
