import { Categories } from 'hap-nodejs';
import { Devices } from 'isy-nodejs';
import { ISYAccessory } from './ISYAccessory';

export class ISYDeviceAccessory<T extends Devices.Insteon.Base, TCategory extends Categories> extends ISYAccessory<T, TCategory> {

	public identify() {
		this.device.sendBeep(100);
	}
}
