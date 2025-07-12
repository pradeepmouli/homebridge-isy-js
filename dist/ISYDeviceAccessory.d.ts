import { Categories } from 'hap-nodejs';
import { Devices } from 'isy-nodejs';
import { ISYAccessory } from './ISYAccessory';
export declare class ISYDeviceAccessory<T extends Devices.Insteon.Base, TCategory extends Categories> extends ISYAccessory<T, TCategory> {
    identify(): void;
}
//# sourceMappingURL=ISYDeviceAccessory.d.ts.map