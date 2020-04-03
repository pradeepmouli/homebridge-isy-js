import { IgnoreDeviceRule, PlatformConfig } from 'config';
import { EventEmitter } from 'events';
import { Accessory, Characteristic, Service } from 'hap-nodejs';
import { TargetHeatingCoolingState } from 'hap-nodejs/dist/lib/gen/HomeKit';
import { API } from 'homebridge';
import { PlatformAccessory } from 'homebridge/lib/platformAccessory';
import {
    ElkAlarmSensorDevice,
    InsteonDimmableDevice,
    InsteonDoorWindowSensorDevice,
    InsteonFanDevice,
    InsteonLockDevice,
    InsteonMotionSensorDevice,
    InsteonOutletDevice,
    InsteonRelayDevice,
    InsteonThermostatDevice,
    ISY,
    ISYDevice,
    ISYNode,
    ISYScene,
    NodeType,
} from 'isy-js';
import { ISYAccessory } from 'ISYAccessory';
import { ISYDeviceAccessory } from 'ISYDeviceAccessory';

import { InsteonDimmableAccessory } from './ISYDimmerAccessory';
import { ISYDoorWindowSensorAccessory } from './ISYDoorWindowSensorAccessory';
import { ISYElkAlarmPanelAccessory } from './ISYElkAlarmPanelAccessory';
import { ISYFanAccessory } from './ISYFanAccessory';
import { ISYGarageDoorAccessory } from './ISYGarageDoorAccessory';
import { ISYLockAccessory } from './ISYLockAccessory';
import { ISYMotionSensorAccessory } from './ISYMotionSensorAccessory';
import { ISYOutletAccessory } from './ISYOutletAccessory';
import { ISYRelayAccessory } from './ISYRelayAccessory';
import { ISYSceneAccessory } from './ISYSceneAccessory';
import { ISYThermostatAccessory } from './ISYThermostatAccessory';
import { didFinishLaunching } from './utils';



const platformName = 'isy-js';
const pluginName = 'homebridge-isy-js';
// tslint:disable-next-line: ordered-imports

export class ISYPlatform {
	public log: { (...args: any[]): void; debug: (...args: any[]) => void; info: (...args: any[]) => void; warn: (...args: any[]) => void; error: (...args: any[]) => void; log: (level: string, msg: unknown) => void; prefix: string; };
	public config: PlatformConfig;
	public host: string;
	public username: string;
	public password: string;
	public elkEnabled: boolean;
	public debugLoggingEnabled: boolean;
	public includeAllScenes: boolean;
	public includedScenes: [];
	public ignoreRules: IgnoreDeviceRule[];
	public homebridge: API;

	public accessories: Map<string, ISYAccessory<any, any>> = new Map<string, ISYAccessory<any, any>>();
	public accessoriesToRegister: PlatformAccessory[] = [];
	public accessoriesToConfigure: Map<string, PlatformAccessory> = new Map<string, PlatformAccessory>();


	public isy: ISY;
	constructor (log: { (...args: any[]): void; debug: (...args: any[]) => void; info: (...args: any[]) => void; warn: (...args: any[]) => void; error: (...args: any[]) => void; log: (level: string, msg: unknown) => void; prefix: string; }, config: PlatformConfig, homebridge: API) {
		this.log = log;
		this.config = config;
		this.host = config.host;
		this.username = config.username;
		this.password = config.password;
		this.elkEnabled = config.elkEnabled;
		this.debugLoggingEnabled = config.debugLoggingEnabled === undefined ? false : config.debugLoggingEnabled;
		this.includeAllScenes = config.includeAllScenes === undefined ? false : config.includeAllScenes;
		this.includedScenes = config.includedScenes === undefined ? [] : config.includedScenes;
		this.ignoreRules = config.ignoreDevices;
		this.homebridge = homebridge;


		this.isy = new ISY(this.host, this.username, this.password, config.elkEnabled, null, config.useHttps, true, this.debugLoggingEnabled, null, this.logger.bind(this));
		const p = this.createAccessories();
		const self = this;

		homebridge.on('didFinishLaunching', async () => {
			self.logger('Homebridge has launched');
			await p;
			self.logger('Accessories created');
			self.logger(`Accessories to Register: ${this.accessoriesToRegister.length}`);
			self.homebridge.registerPlatformAccessories(
				pluginName, platformName, this.accessoriesToRegister);
			this.accessoriesToRegister = [];
			self.logger(`Accessories to Remove: ${this.accessoriesToConfigure.size}`);
			self.homebridge.unregisterPlatformAccessories(pluginName, platformName, Array.from(this.accessoriesToConfigure.values()));
			this.accessoriesToConfigure.clear();
		});
	}

	public logger(msg: string) {
		if (this.debugLoggingEnabled || (process.env.ISYJSDEBUG !== undefined && process.env.IYJSDEBUG !== null)) {
			// var timeStamp = new Date();
			this.log.info(`Platform: ${msg}`);
		}
	}
	// Checks the device against the configuration to see if it should be ignored.
	public shouldIgnore(device: ISYNode) {
		const deviceAddress = device.address;
		const returnValue = true;
		if (device instanceof ISYScene && this.includeAllScenes === false) {
			for (const sceneAddress of this.includedScenes) {
				if (sceneAddress === deviceAddress) {
					return false;
				}
			}

		}
		if (this.config.ignoreDevices === undefined) {
			return false;
		}
		if (this.includeAllScenes || device instanceof ISYDevice) {
			const deviceName = device.name;
			for (const rule of this.ignoreRules) {
				if (rule.nameContains !== undefined && rule.nameContains !== '') {
					if (deviceName.indexOf(rule.nameContains) === -1) {
						continue;
					}
				}
				if (rule.lastAddressDigit !== undefined && rule.lastAddressDigit !== null) {
					if (deviceAddress.indexOf(String(rule.lastAddressDigit), deviceAddress.length - 2) === -1) {
						continue;
					}
				}
				if (rule.address !== undefined && rule.address !== '') {
					if (deviceAddress !== rule.address) {
						continue;
					}
				}
				if (rule.nodeDef !== undefined) {
					if (device.nodeDefId !== rule.nodeDef) {
						continue;
					}
				}
				if (rule.folder !== undefined) {
					if (device.folder !== rule.folder) {
						continue;
					}
				}
				this.log.info(`Ignoring device: ${deviceName} (${deviceAddress}) because of rule: ${JSON.stringify(rule)}`);
				return true;
			}
		}

		return false;
	}
	public getGarageEntry(address: string) {
		const garageDoorList = this.config.garageDoors;
		if (garageDoorList !== undefined) {
			for (let index = 0; index < garageDoorList.length; index++) {
				const garageEntry = garageDoorList[index];
				if (garageEntry.address === address) {
					return garageEntry;
				}
			}
		}
		return null;
	}
	public renameDeviceIfNeeded(device: ISYNode) {
		const deviceAddress = device.address;
		const deviceName = device.name;
		// if (this.config.renameDevices === undefined) {
		// return deviceName;
		// }
		if (this.config.transformNames !== undefined) {
			if (this.config.transformNames.remove !== undefined)
				for (const removeText of this.config.transformNames.remove) {
					deviceName.replace(removeText, '');

				}
			if (this.config.transformNames.replace !== undefined)
				for (const replaceRule of this.config.transformNames.replace) {
					deviceName.replace(replaceRule.replace, replaceRule.with);

				}
		}
		if (this.config.renameDevices !== undefined) {
			for (const rule of this.config.renameDevices) {
				if (rule.name !== undefined && rule.name !== '') {
					if (deviceName.indexOf(rule.name) === -1) {
						continue;
					}
				}

				if (rule.address !== undefined && rule.address !== '') {
					if (deviceAddress !== rule.address) {
						continue;
					}
				}
				if (rule.newName === undefined) {
					this.log.info(`Rule to rename device is present but no new name specified. Impacting device: ${deviceName}`);
					return deviceName;
				} else {
					this.log.info(`Renaming device: ${deviceName}[${deviceAddress}] to [${rule.newName}] because of rule [${rule.name}] [${rule.newName}] [${rule.address}]`);
					return rule.newName;
				}
			}
		}
		return deviceName;
	}


	public configureAccessory(accessory: PlatformAccessory) {
		try {
			let i = this.accessories.get(accessory.UUID);
			if (i) {

				i.configure(accessory);
			}
			else {
				this.accessoriesToConfigure.set(accessory.UUID, accessory);
			}



			return true;
		}
		catch
		{
			return false;
		}

	}

	// Calls the isy-js library, retrieves the list of devices, and maps them to appropriate ISYXXXXAccessory devices.
	public async createAccessories() {
		const that = this;
		await this.isy.initialize(() => {
			const results: ISYAccessory<any, any>[] = [];

			const deviceList = that.isy.deviceList;
			this.log.info(`ISY has ${deviceList.size} devices and ${that.isy.sceneList.size} scenes`);
			for (const device of deviceList.values()) {
				let homeKitDevice: ISYAccessory<any, any> = null;
				let id = '';
				const garageInfo = that.getGarageEntry(device.address);
				if (!that.shouldIgnore(device) && !device.hidden) {
					if (results.length >= 100) {
						that.logger('Skipping any further devices as 100 limit has been reached');
						break;
					}
					device.name = that.renameDeviceIfNeeded(device);
					if (garageInfo !== null) {
						let relayAddress = device.address.substr(0, device.address.length - 1);
						relayAddress += `2`;
						const relayDevice = that.isy.getDevice(relayAddress);
						homeKitDevice = new ISYGarageDoorAccessory(device, relayDevice, garageInfo.name, garageInfo.timeToOpen, garageInfo.alternate);
					} else {
						homeKitDevice = that.createAccessory(device);
						id = homeKitDevice.UUID;


					}

					if (homeKitDevice !== null) {
						results.push(homeKitDevice);
						// Make sure the device is address to the global map
						// deviceMap[device.address] = homeKitDevice;

						//results.set(id,homeKitDevice);


					}
				}
			}
			for (const scene of this.isy.sceneList.values()) {
				if (!this.shouldIgnore(scene)) {
					results.push(new ISYSceneAccessory(scene));
				}
			}

			if (that.isy.elkEnabled) {
				//if (results.size >= 100) {
				//that.logger('Skipping adding Elk Alarm panel as device count already at maximum');
				//}

				const panelDevice = that.isy.getElkAlarmPanel();
				panelDevice.name = that.renameDeviceIfNeeded(panelDevice);
				const panelDeviceHK = new ISYElkAlarmPanelAccessory(panelDevice);
				// deviceMap[panelDevice.address] = panelDeviceHK;
				results.push(panelDeviceHK);

			}
			that.log.info(`Filtered device list has: ${results.length} devices`);
			for (const homeKitDevice of results) {
				const s = this.accessoriesToConfigure.get(homeKitDevice.UUID);
				if (s !== null && s !== undefined) {
					homeKitDevice.configure(s);
					this.accessoriesToConfigure.delete(homeKitDevice.UUID);
				}
				else {
					homeKitDevice.configure();
					this.accessoriesToRegister.push(homeKitDevice.platformAccessory);
				}
			}

		});
	}

	public createAccessory(device: ISYDevice<any>): ISYAccessory<any, any> {

		if (device instanceof InsteonDimmableDevice) {
			return new InsteonDimmableAccessory(device);
		} else if (device instanceof InsteonRelayDevice) {
			return new ISYRelayAccessory(device);
		} else if (device instanceof InsteonLockDevice) {
			return new ISYLockAccessory(device);
		} else if (device instanceof InsteonOutletDevice) {
			return new ISYOutletAccessory(device);
		} else if (device instanceof InsteonFanDevice) {
			return new ISYFanAccessory(device);
		} else if (device instanceof InsteonDoorWindowSensorDevice) {
			return new ISYDoorWindowSensorAccessory(device);
		} else if (device instanceof ElkAlarmSensorDevice) {
			return new ISYElkAlarmPanelAccessory(device);
		} else if (device instanceof InsteonMotionSensorDevice) {
			return new ISYMotionSensorAccessory(device);
		} else if (device instanceof InsteonThermostatDevice) {
			return new ISYThermostatAccessory(device);
		}
		return null;
	}
}
