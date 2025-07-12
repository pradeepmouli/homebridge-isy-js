"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.HAP = exports.User = exports.Characteristic = exports.Service = exports.PlatformAccessory = exports.PlatformName = exports.PluginName = void 0;
const ISYPlatform_1 = require("./ISYPlatform");
require("./utils");
const utils_1 = require("./utils");
exports.PluginName = 'homebridge-isy';
exports.PlatformName = 'ISY';
exports.default = (homebridge) => {
    exports.PlatformAccessory = homebridge.platformAccessory;
    exports.Service = homebridge.hap.Service;
    exports.Characteristic = homebridge.hap.Characteristic;
    exports.User = homebridge.user;
    exports.HAP = homebridge.hap;
    exports.generate = homebridge.hap.uuid.generate;
    exports.PlatformAccessory.prototype.getOrAddService = function (service) {
        const acc = this;
        const serv = acc.getService(service);
        if (!serv) {
            return acc.addService(service);
        }
        return serv;
    };
    (exports.Characteristic.prototype).onGet = function (func, converter) {
        const c = this;
        return (0, utils_1.onGet)(c, func);
    };
    (exports.Characteristic.prototype).onSet = function (func, converter) {
        const c = this;
        return (0, utils_1.onSet)(c, func, converter);
    };
    // require('./utils');
    homebridge.registerPlatform(exports.PluginName, exports.PlatformName, ISYPlatform_1.ISYPlatform);
    return this;
};
//# sourceMappingURL=plugin.js.map