
import { CharacteristicValue, WithUUID } from 'hap-nodejs';
import * as HB from 'homebridge';
import { Logging } from 'homebridge/lib/logger';
import { Controls, Family, Node as ISYNode } from 'isy-nodejs';
import { ISYPlatform } from './ISYPlatform';
import { Characteristic, generate, PlatformAccessory, Service } from './plugin';
import { PlatformName } from './plugin';


export class AccessoryContext {
	public address?: string;
}

export class ISYAccessory<T extends ISYNode, TCategory extends HB.Categories> {
	[x: string]: any;
	public logger: Logging;
	public device: T;
	public address: any;
	public UUID: string;
	public informationService!: HB.Service;
	public name: string;
	public displayName: string;
	public platformAccessory!: HB.PlatformAccessory;
	public category!: TCategory;
	public primaryService!: HB.Service;

	// tslint:disable-next-line: ban-types
	public bind<TFunction extends Function>(func: TFunction): TFunction {
		return func.bind(this.device);
	}

	constructor(device: T, platform: ISYPlatform) {
		const s = generate(`${device.isy.address}:${device.address}1`);

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

	public map(propertyName: keyof T, propertyValue: any): { characteristicValue: CharacteristicValue, characteristic?: WithUUID<new () => HB.Characteristic>, service: HB.Service; } {
		const outputVal = this.convert(propertyValue, propertyName);
		if (propertyName === 'ST') {
			return { characteristicValue: outputVal, characteristic: Characteristic.On, service: this.primaryService };
		}
		return { characteristicValue: outputVal, service: this.primaryService };
	}

	public handleControlTrigger(controlName: string) {
		this.logger.info(`${Controls[controlName].label} triggered.`);
	}

	public configure(accessory?: HB.PlatformAccessory) {
		if (accessory) {
			if (!accessory.getOrAddService) {
				accessory.getOrAddService = PlatformAccessory.prototype.getOrAddService.bind(accessory);
			}
			accessory.displayName = this.displayName;
			this.platformAccessory = accessory;
			this.platformAccessory.context.address = this.address;
			this.logger.info('Configuring linked platform accessory');

		} else {
			this.platformAccessory = new PlatformAccessory(this.displayName, this.UUID, this.category);
			this.platformAccessory.context.address = this.address;
			this.logger.info('New platform accessory needed');

		}
		this.setupServices();
		this.primaryService.isPrimaryService = true;
		this.platformAccessory.on('identify', () => this.identify.bind(this));
	}

	public setupServices() {
		this.informationService = this.platformAccessory.getOrAddService(Service.AccessoryInformation);
		this.informationService
			.getCharacteristic(Characteristic.Manufacturer).updateValue(
				Family[this.device.family] ?? 'Universal Devices, Inc.');
		this.informationService.getCharacteristic(Characteristic.Model).updateValue(this.device.productName ?? this.device.name);
		this.informationService.getCharacteristic(Characteristic.SerialNumber).updateValue(this.device.modelNumber ?? this.device.address);
		this.informationService.getCharacteristic(Characteristic.FirmwareRevision).updateValue(this.device.version ?? '1.0');
		// .setCharacteristic(Characteristic.ProductData, this.device.address);
	}

	public handlePropertyChange(propertyName: string, value: any, oldValue: any, formattedValue: string) {
		const name = propertyName in Controls ? Controls[propertyName].label : propertyName;
		this.logger.info(`Incoming update to ${name}. New Value: ${value} (${formattedValue}) Old Value: ${oldValue}`);
		const m = this.map(propertyName, value);
		if (m.characteristic) {
			this.logger.debug('Property mapped to:', m.service.displayName, m.characteristic.name, `(${m.characteristicValue})`);
			this.updateCharacteristicValue(m.characteristicValue, m.characteristic, m.service);
		} else {
			this.logger.info('Property not mapped.');
		}
	}

	public updateCharacteristicValue(value: CharacteristicValue, characteristic: WithUUID<new () => HB.Characteristic>, service: HB.Service) {
		service.updateCharacteristic(characteristic, value);

	}

	public convert(value: any, propertyName: keyof T) : CharacteristicValue;

	public convert(value: CharacteristicValue, characteristic: HB.Characteristic) : any;

	public convert(value: any | CharacteristicValue, property?: keyof T | HB.Characteristic): any | CharacteristicValue {
		if (property instanceof Characteristic) {
			return this.convertFrom(property, value);
		} else {
			return this.convertTo(property, value);
							}
	}

	public convertTo(propertyName: keyof T, value: CharacteristicValue): any  {
		return value;
	}

	public convertFrom(characteristic: HB.Characteristic, value: CharacteristicValue): any {
		return value;
	}
	public identify() {
		// Do the identify action

	}
}
