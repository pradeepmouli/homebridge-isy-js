import { API, DynamicPlatformPlugin, Logging, PlatformAccessory } from 'homebridge';
import { ISY, Node as ISYNode } from 'isy-nodejs';
import { DeviceConfig, PlatformConfig } from '../typings/config';
import { ISYAccessory } from './ISYAccessory';
import './utils';
export declare class ISYPlatform implements DynamicPlatformPlugin {
    log: Logging;
    config: PlatformConfig;
    host: string;
    username: string;
    password: string;
    elkEnabled: boolean;
    debugLoggingEnabled: boolean;
    homebridge: API;
    static Instance: ISYPlatform;
    accessories: PlatformAccessory[];
    accessoriesWrappers: Map<string, ISYAccessory<any, any>>;
    accessoriesToRegister: PlatformAccessory[];
    accessoriesToConfigure: Map<string, PlatformAccessory>;
    deviceConfigMap: Map<string, DeviceConfig[]>;
    isy: ISY;
    constructor(log: Logging, config: PlatformConfig, homebridge: API);
    shouldIgnore(device: ISYNode): boolean;
    rename(device: ISYNode): void;
    getGarageEntry(address: string): any;
    renameDeviceIfNeeded(device: ISYNode): any;
    configureAccessory(accessory: PlatformAccessory): boolean;
    createAccessories(): Promise<void>;
    createAccessory(device: ISYDevice<any>): ISYAccessory<any, any>;
}
//# sourceMappingURL=ISYPlatform.d.ts.map