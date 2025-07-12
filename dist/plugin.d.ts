import * as HAPNodeJS from "hap-nodejs";
import { API, Characteristic as C, PlatformAccessory as PA, Service as S, User as U } from 'homebridge';
import './utils';
export declare const PluginName = "homebridge-isy";
export declare const PlatformName = "ISY";
export declare let PlatformAccessory: typeof PA;
export declare let Service: typeof S;
export declare let Characteristic: typeof C;
export declare let User: typeof U;
export declare let HAP: typeof HAPNodeJS;
export declare let generate: (data: any) => string;
declare const _default: (homebridge: API) => undefined;
export default _default;
//# sourceMappingURL=plugin.d.ts.map