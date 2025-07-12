"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYPlatform = void 0;
const fs_1 = require("fs");
const isy_nodejs_1 = require("isy-nodejs");
const InsteonMotionSensorDevice_1 = require("isy-nodejs/lib/Devices/Insteon/InsteonMotionSensorDevice");
const ISYDimmableAccessory_1 = require("./ISYDimmableAccessory");
const ISYDoorWindowSensorAccessory_1 = require("./ISYDoorWindowSensorAccessory");
const ISYElkAlarmPanelAccessory_1 = require("./ISYElkAlarmPanelAccessory");
const ISYFanAccessory_1 = require("./ISYFanAccessory");
const ISYGarageDoorAccessory_1 = require("./ISYGarageDoorAccessory");
const ISYKeypadDimmerAccessory_1 = require("./ISYKeypadDimmerAccessory");
const ISYLeakSensorAccessory_1 = require("./ISYLeakSensorAccessory");
const ISYLockAccessory_1 = require("./ISYLockAccessory");
const ISYMotionSensorAccessory_1 = require("./ISYMotionSensorAccessory");
const ISYOutletAccessory_1 = require("./ISYOutletAccessory");
const ISYRelayAccessory_1 = require("./ISYRelayAccessory");
const ISYSceneAccessory_1 = require("./ISYSceneAccessory");
const ISYSmokeSensorAccessory_1 = require("./ISYSmokeSensorAccessory");
const ISYThermostatAccessory_1 = require("./ISYThermostatAccessory");
const plugin_1 = require("./plugin");
require("./utils");
const utils_1 = require("./utils");
// tslint:disable-next-line: ordered-imports
class ISYPlatform {
    constructor(log, config, homebridge) {
        var _a, _b, _c;
        this.accessories = [];
        this.accessoriesWrappers = new Map();
        this.accessoriesToRegister = [];
        this.accessoriesToConfigure = new Map();
        this.deviceConfigMap = new Map();
        this.log = log;
        this.config = config;
        this.host = config.host;
        this.username = config.username;
        this.password = config.password;
        this.elkEnabled = (_a = config.elkEnabled) !== null && _a !== void 0 ? _a : false;
        this.debugLoggingEnabled = (_b = config.debugLoggingEnabled) !== null && _b !== void 0 ? _b : false;
        this.config = (0, utils_1.cleanConfig)(config);
        const self = this;
        (0, fs_1.writeFile)(`${homebridge.user.storagePath()}/effectiveConfig.json`, JSON.stringify(this.config, null, '\t'), null, () => self.log('platform config saved to :', `${homebridge.user.storagePath()}/effectiveConfig.json`));
        this.homebridge = homebridge;
        ISYPlatform.Instance = this;
        config.address = this.host;
        config.displayNameFormat = (_c = config.deviceNaming) === null || _c === void 0 ? void 0 : _c.format;
        const isylog = (0, utils_1.clone)(log, 'isy-nodejs');
        this.isy = new isy_nodejs_1.ISY(config, isylog, homebridge.user.storagePath());
        const p = this.createAccessories();
        homebridge.on("didFinishLaunching" /* APIEvent.DID_FINISH_LAUNCHING */, async () => {
            self.log('Homebridge Launched');
            await p;
            self.log('ISY API Initialized');
            self.log('Homebridge API Version', self.homebridge.version);
            self.log('Homebridge Server Version', self.homebridge.serverVersion);
            self.log('ISY Host Address', self.host);
            self.log('ISY Model', self.isy.model);
            self.log('ISY Firmware Version', self.isy.serverVersion);
            self.log(`Total Accessories: ${this.accessories.length}`);
            self.log(`Total Accessories Identified: ${this.accessoriesWrappers.size}`);
            self.log(`Accessories to Register: ${this.accessoriesToRegister.length}`);
            if (this.accessoriesToRegister.length > 0) {
                self.log('Registering Platform Accessories');
                self.homebridge.registerPlatformAccessories(plugin_1.PluginName, plugin_1.PlatformName, this.accessoriesToRegister);
                this.accessoriesToRegister = [];
            }
            self.log(`Orphan Accessories: ${this.accessoriesToConfigure.size}`);
            /*if (this.accessoriesToConfigure.size > 0) {
                self.log('Removing Platform Accessories');
                self.homebridge.unregisterPlatformAccessories(PluginName, PlatformName, Array.from(this.accessoriesToConfigure.values()));
                this.accessoriesToConfigure.clear();
            }*/
            self.homebridge.updatePlatformAccessories(this.accessories);
        });
    }
    // Checks the device against the configuration to see if it should be ignored.
    // TODO: allow multiple rules...
    shouldIgnore(device) {
        var _a;
        const configs = this.deviceConfigMap.get(device.address);
        if ((_a = this.config.deviceDefaults) === null || _a === void 0 ? void 0 : _a.exclude) {
            const include = configs.find((q, r, z) => {
                return (0, utils_1.isMatch)(device, q.filter) && !q.exclude;
            });
            if (include) {
                this.log(`Device: ${device.displayName}`, ' will be included due to rule: ', JSON.stringify(include));
                return false;
            }
            return true;
        }
        else {
            const ignore = configs === null || configs === void 0 ? void 0 : configs.find((p, q, r) => p.exclude);
            if (ignore) {
                const include = configs.find((q, r, z) => {
                    return (0, utils_1.isMatch)(device, q.filter) && !q.exclude;
                });
                if (include) {
                    this.log(`Device: ${device.displayName} would have been ignored due to rule: `, JSON.stringify(ignore), 'but will be included due to rule: ', JSON.stringify(include));
                    return false;
                }
                this.log(`Device: ${device.displayName} will be ignored due to rule: `, JSON.stringify(ignore));
                return true;
            }
            return false;
        }
    }
    rename(device) {
        const configs = this.deviceConfigMap.get(device.address);
        const renameRule = configs === null || configs === void 0 ? void 0 : configs.find((p, q, r) => p.newName);
        if (renameRule) {
            device.displayName = renameRule.newName;
            this.log(`Device: ${device.displayName} was renamed due to rule: `, JSON.stringify(renameRule));
            return;
        }
        else {
            if (this.config.deviceNaming) {
                if (this.config.deviceNaming.remove) {
                    for (const removeText of this.config.deviceNaming.remove) {
                        device.displayName = device.displayName.replace(removeText, '');
                    }
                }
                if (this.config.deviceNaming.replace) {
                    for (const replaceRule of this.config.deviceNaming.replace) {
                        device.displayName = device.displayName.replace(replaceRule.replace, replaceRule.with);
                    }
                }
            }
        }
    }
    getGarageEntry(address) {
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
    renameDeviceIfNeeded(device) {
        const deviceAddress = device.address;
        const deviceName = device.name;
        // if (this.config.renameDevices === undefined) {
        // return deviceName;
        // }
        if (this.config.transformNames !== undefined) {
            if (this.config.transformNames.remove !== undefined) {
                for (const removeText of this.config.transformNames.remove) {
                    deviceName.replace(removeText, '');
                }
            }
            if (this.config.transformNames.replace !== undefined) {
                for (const replaceRule of this.config.transformNames.replace) {
                    deviceName.replace(replaceRule.replace, replaceRule.with);
                }
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
                }
                else {
                    this.log.info(`Renaming device: ${deviceName}[${deviceAddress}] to [${rule.newName}] because of rule [${rule.name}] [${rule.newName}] [${rule.address}]`);
                    return rule.newName;
                }
            }
        }
        return deviceName;
    }
    configureAccessory(accessory) {
        const self = this;
        try {
            const i = this.accessoriesWrappers.get(accessory.UUID);
            if (i) {
                self.log('Accessory Wrapper Exists');
                i.configure(accessory);
            }
            else {
                this.accessoriesToConfigure.set(accessory.UUID, accessory);
            }
            this.accessories.push(accessory);
            return true;
        }
        catch (ex) {
            throw ex;
        }
    }
    // Calls the isy-nodejs library, retrieves the list of devices, and maps them to appropriate ISYXXXXAccessory devices.
    async createAccessories() {
        const that = this;
        await this.isy.initialize(() => true).then(() => {
            const results = [];
            that.log(`Accessories to configure: ${this.accessoriesToConfigure.size}`);
            const deviceList = that.isy.deviceList;
            this.log.info(`ISY has ${deviceList.size} devices and ${that.isy.sceneList.size} scenes`);
            for (const device of deviceList.values()) {
                const configs = [];
                for (const config of that.config.devices) {
                    if ((0, utils_1.isMatch)(device, config.filter)) {
                        configs.push(config);
                        /* 		this.log.debug('Config', JSON.stringify(config, null, '\t'),
                                    'added for device', `${device.name}(${device.displayName})`); */
                    }
                }
                this.deviceConfigMap.set(device.address, configs);
            }
            for (const device of that.isy.sceneList.values()) {
                const configs = [];
                for (const config of that.config.devices) {
                    if ((0, utils_1.isMatch)(device, config.filter)) {
                        configs.push(config);
                        /* 	this.log.debug('Config', JSON.stringify(config, null, '\t'),
                                'added for scene', device.name + '(' + device.displayName + ')'); */
                    }
                }
                this.deviceConfigMap.set(device.address, configs);
            }
            for (const device of deviceList.values()) {
                let homeKitDevice = null;
                const garageInfo = that.getGarageEntry(device.address);
                if (!that.shouldIgnore(device) && !device.hidden) {
                    if (results.length >= 100) {
                        that.log.warn('Skipping any further devices as 100 limit has been reached');
                        break;
                    }
                    this.rename(device);
                    if (garageInfo !== null) {
                        let relayAddress = device.address.substr(0, device.address.length - 1);
                        relayAddress += `2`;
                        const relayDevice = that.isy.getDevice(relayAddress);
                        homeKitDevice = new ISYGarageDoorAccessory_1.ISYGarageDoorAccessory(device, relayDevice, garageInfo.name, garageInfo.timeToOpen, garageInfo.alternate, this);
                    }
                    else {
                        homeKitDevice = that.createAccessory(device);
                    }
                    if (homeKitDevice !== null) {
                        if (device.address.endsWith('1')) { //Parents only
                            results.push(homeKitDevice);
                        }
                        // if (homeKitDevice instanceof ISYKeypadDimmerAccessory) {
                        // results.push(new ISYDimmableAccessory(device as InsteonDimmableDevice, this));
                        // 	} Double device load not needed
                        // Make sure the device is address to the global map
                        // deviceMap[device.address] = homeKitDevice;
                        // results.set(id,homeKitDevice);
                    }
                    else {
                        that.log.warn(`Device ${device.displayName} is not supported yet.`);
                    }
                }
            }
            for (const scene of this.isy.sceneList.values()) {
                if (!this.shouldIgnore(scene)) {
                    results.push(new ISYSceneAccessory_1.ISYSceneAccessory(scene, this));
                }
            }
            if (that.isy.elkEnabled && that.isy.getElkAlarmPanel()) {
                // if (results.size >= 100) {
                // that.logger('Skipping adding Elk Alarm panel as device count already at maximum');
                // }
                const panelDevice = that.isy.getElkAlarmPanel();
                panelDevice.name = that.renameDeviceIfNeeded(panelDevice);
                const panelDeviceHK = new ISYElkAlarmPanelAccessory_1.ISYElkAlarmPanelAccessory(panelDevice, this);
                // deviceMap[panelDevice.address] = panelDeviceHK;
                results.push(panelDeviceHK);
            }
            that.log.info(`Filtered device list has: ${results.length} devices`);
            for (const homeKitDevice of results) {
                this.accessoriesWrappers.set(homeKitDevice.UUID, homeKitDevice);
                const s = this.accessoriesToConfigure.get(homeKitDevice.UUID);
                if (s !== null && s !== undefined) {
                    // that.log("Configuring linked accessory");
                    homeKitDevice.configure(s);
                    that.accessoriesToConfigure.delete(homeKitDevice.UUID);
                }
                else {
                    homeKitDevice.configure();
                    this.accessories.push(homeKitDevice.platformAccessory);
                    // that.homebridge.registerPlatformAccessories(pluginName, platformName, [homeKitDevice.platformAccessory]);
                    this.accessoriesToRegister.push(homeKitDevice.platformAccessory);
                }
            }
        });
    }
    createAccessory(device) {
        if (device instanceof InsteonKeypadDimmerDevice) {
            return new ISYKeypadDimmerAccessory_1.ISYKeypadDimmerAccessory(device, this);
        }
        else if (device instanceof InsteonDimmableDevice) {
            return new ISYDimmableAccessory_1.ISYDimmableAccessory(device, this);
        }
        else if (device instanceof InsteonRelayDevice) {
            return new ISYRelayAccessory_1.ISYRelayAccessory(device, this);
        }
        else if (device instanceof InsteonLockDevice) {
            return new ISYLockAccessory_1.ISYLockAccessory(device, this);
        }
        else if (device instanceof InsteonOutletDevice) {
            return new ISYOutletAccessory_1.ISYOutletAccessory(device, this);
        }
        else if (device instanceof InsteonLeakSensorDevice) {
            return new ISYLeakSensorAccessory_1.ISYLeakSensorAccessory(device, this);
        }
        else if (device instanceof InsteonSmokeSensorDevice) {
            return new ISYSmokeSensorAccessory_1.ISYSmokeSensorAccessory(device, this);
        }
        else if (device instanceof InsteonFanDevice) {
            return new ISYFanAccessory_1.ISYFanAccessory(device, this);
        }
        else if (device instanceof InsteonDoorWindowSensorDevice) {
            return new ISYDoorWindowSensorAccessory_1.ISYDoorWindowSensorAccessory(device, this);
        }
        else if (device instanceof ELKAlarmPanelDevice) {
            return new ISYElkAlarmPanelAccessory_1.ISYElkAlarmPanelAccessory(device, this);
        }
        else if (device instanceof InsteonMotionSensorDevice_1.InsteonMotionSensorDevice) {
            return new ISYMotionSensorAccessory_1.ISYMotionSensorAccessory(device, this);
        }
        else if (device instanceof InsteonThermostatDevice) {
            return new ISYThermostatAccessory_1.ISYThermostatAccessory(device, this);
        }
        else if (device instanceof InsteonLeakSensorDevice) {
            return new ISYLeakSensorAccessory_1.ISYLeakSensorAccessory(device, this);
        }
        return null;
    }
}
exports.ISYPlatform = ISYPlatform;
//# sourceMappingURL=ISYPlatform.js.map