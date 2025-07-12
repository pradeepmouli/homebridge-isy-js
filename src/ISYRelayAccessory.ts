
import { Categories } from 'homebridge';
import { Devices } from 'isy-nodejs';
import { ISYDeviceAccessory } from './ISYDeviceAccessory';
import { Characteristic, Service } from './plugin';
import './utils';

export class ISYRelayAccessory<T extends Devices.Insteon.RelaySwitch | Devices.Insteon.RelayLamp> extends ISYDeviceAccessory<T, Categories.SWITCH | Categories.LIGHTBULB | Categories.OUTLET> {

	constructor(device: T, platform) {
		super(device, platform);
		this.category = Categories.SWITCH;
		this.dimmable = (device as any).isDimmable || false;

	}

	public map(propertyName: keyof T, propertyValue: any) {
		const o = super.map(propertyName, propertyValue);
		if (propertyName === 'ST') {
			o.characteristic = Characteristic.On;
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
	public setupServices() {
		super.setupServices();
		this.primaryService = this.platformAccessory.getOrAddService(Service.Switch);
		this.primaryService.getCharacteristic(Characteristic.On).onGet(() => this.device.isOn).onSet(this.bind(this.device.updateIsOn));

	}
}
