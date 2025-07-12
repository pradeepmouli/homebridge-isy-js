import { Categories } from 'homebridge';
import { Devices } from 'isy-nodejs';
import { ISYDeviceAccessory } from './ISYDeviceAccessory';
import './utils';
export declare class ISYRelayAccessory<T extends Devices.Insteon.RelaySwitch | Devices.Insteon.RelayLamp> extends ISYDeviceAccessory<T, Categories.SWITCH | Categories.LIGHTBULB | Categories.OUTLET> {
    constructor(device: T, platform: any);
    map(propertyName: keyof T, propertyValue: any): {
        characteristicValue: import("homebridge").CharacteristicValue;
        characteristic?: import("homebridge").WithUUID<new () => import("homebridge").Characteristic>;
        service: import("homebridge").Service;
    };
    setupServices(): void;
}
//# sourceMappingURL=ISYRelayAccessory.d.ts.map