import { CharacteristicValue, WithUUID } from 'hap-nodejs';
import * as HB from 'homebridge';
import { Logging } from 'homebridge/lib/logger';
import { Node as ISYNode } from 'isy-nodejs';
import { ISYPlatform } from './ISYPlatform';
export declare class AccessoryContext {
    address?: string;
}
export declare class ISYAccessory<T extends ISYNode, TCategory extends HB.Categories> {
    [x: string]: any;
    logger: Logging;
    device: T;
    address: any;
    UUID: string;
    informationService: HB.Service;
    name: string;
    displayName: string;
    platformAccessory: HB.PlatformAccessory;
    category: TCategory;
    primaryService: HB.Service;
    bind<TFunction extends Function>(func: TFunction): TFunction;
    constructor(device: T, platform: ISYPlatform);
    map(propertyName: keyof T, propertyValue: any): {
        characteristicValue: CharacteristicValue;
        characteristic?: WithUUID<new () => HB.Characteristic>;
        service: HB.Service;
    };
    handleControlTrigger(controlName: string): void;
    configure(accessory?: HB.PlatformAccessory): void;
    setupServices(): void;
    handlePropertyChange(propertyName: string, value: any, oldValue: any, formattedValue: string): void;
    updateCharacteristicValue(value: CharacteristicValue, characteristic: WithUUID<new () => HB.Characteristic>, service: HB.Service): void;
    convert(value: any, propertyName: keyof T): CharacteristicValue;
    convert(value: CharacteristicValue, characteristic: HB.Characteristic): any;
    convertTo(propertyName: keyof T, value: CharacteristicValue): any;
    convertFrom(characteristic: HB.Characteristic, value: CharacteristicValue): any;
    identify(): void;
}
//# sourceMappingURL=ISYAccessory.d.ts.map