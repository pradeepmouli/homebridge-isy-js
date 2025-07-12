import * as log4js from '@log4js-node/log4js-api';
import { CharacteristicEventTypes, CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service, WithUUID } from 'hap-nodejs';
import * as HB from 'homebridge';

import { Logger, Logging } from 'homebridge/lib/logger';
import { Family, ISYDevice, ISYNode, ISYScene } from 'isy-nodejs';
import { DeviceConfig, DeviceConfigDetail, DeviceFilterRule, IgnoreDeviceRule, PlatformConfig, RenameDeviceRule } from 'typings/config';
import { ISYPlatform } from './ISYPlatform';
import { Characteristic, PlatformAccessory } from './plugin';

// import * as service from 'homebridge/node_modules/homebridge/node_modules/hap-nodejs/dist/lib/Service';
import { Characteristic as C } from 'homebridge';

export const didFinishLaunching: symbol = Symbol('didFinishLaunching');

export let Hap;

declare global {
	interface Promise<T> {
		handleWith(callback: (...arg: any) => void): Promise<void>;
	}
}

export function isMatch(device: ISYNode, filter: DeviceFilterRule): boolean {
	if (filter.lastAddressDigit) {
		if (!device.address.endsWith(filter.lastAddressDigit)) {
			return false;
		}
	}
	if (filter.name) {
		return device.name.includes(filter.name.trim());
	}
	if (filter.folder) {
		return device.folder.trim().toUpperCase() === filter.folder.trim().toUpperCase();
	}
	if (filter.nodeDef) {
		return device.nodeDefId.includes(filter.nodeDef);
	} /*to support _ADV variants*/
	if (filter.family) {
		// console.log(typeof filter.family, filter.family, typeof Family[filter.family]);
		// console.log(typeof device.family, device.family, typeof Family[device.family]);

		const t = Family[device.family] === filter.family as unknown as string;
		// console.log(t);
		return t;
	}
	if (filter.typeCode) {
		if (device instanceof ISYDevice) {
			return device.typeCode.includes(filter.typeCode);
		}
	}
	if (filter.address) {
		return device.address.toString().includes(filter.address);
	}
	return false;
}

export function cleanConfig(config: PlatformConfig) {
	if (!config.devices) {
		config.devices = [] as DeviceConfig[];
	}
	if (!config.includeAllScenes && config.includeAllScenes !== undefined) {
		if (config.includedScenes) {
			for (const i of config.includedScenes as string[]) {

				config.devices.push(
					{
						filter:
						{
							name: i,
							filterType: 'name',
						},
						exclude: false,

					} as DeviceConfig,
				);
			}
		}
		config.devices.push(
			{
				filter:
				{
					// tslint:disable-next-line: quotemark
					filterType: 'family',
					family: 'Scene' as any,

				},
				exclude: true,

			} as DeviceConfig,
		);
	}
	if (config.ignoreDevices) {
		for (const i of config.ignoreDevices as IgnoreDeviceRule[]) {

			const l = {
				filter:
					{

					} as DeviceFilterRule,
				exclude: true,
			} as DeviceConfig;
			if (i.nameContains && i.nameContains !== '') {
				l.filter.name = i.nameContains;
				l.filter.filterType = 'name';
			} else if (i.address && i.address !== '') {
				l.filter.address = i.address;
				l.filter.filterType = 'address';
			} else if (i.folder && i.folder !== '') {
				l.filter.folder = i.folder;
				l.filter.filterType = 'folder';
			} else if (i.family && i.family !== '') {
				l.filter.family = Family[i.family];
				l.filter.filterType = 'family';
			} else if (i.nodeDef && i.nodeDef !== '') {
				l.filter.nodeDef = i.nodeDef;
				l.filter.filterType = 'nodeDef';
			} else if (i.typeCode && i.typeCode !== '') {
				l.filter.typeCode = i.typeCode;
				l.filter.filterType = 'typeCode';
			}
			if (i.lastAddressDigit && i.lastAddressDigit !== '') {
				l.filter.lastAddressDigit = i.lastAddressDigit.toString();
			}
			config.devices.push(
				l,
			);
		}

		config.ignoreDevices = undefined;
	}
	if (config.renameDevices) {
		for (const i of config.renameDevices as RenameDeviceRule[]) {
			const r = {
				filter:
				{

				},

				exclude: false,
				newName: i.newName,

			} as DeviceConfig;
			if (i.name && i.name !== '') {
				r.filter.name = i.name;
				r.filter.filterType = 'name';
			} else if (i.address && i.address !== '') {
				r.filter.address = i.address;
				r.filter.filterType = 'address';
			}
			r.exclude = false;
			r.newName = i.newName;

			config.devices.push(
				r,
			);
		}
		config.renameDevices = undefined;
	}

	return config;
}



// tslint:disable-next-line: no-namespace

// tslint:disable-next-line: no-namespace

export function onSet<T extends CharacteristicValue>(character: HB.Characteristic, func: (arg: T) => Promise<any>, converter?: (char: WithUUID<HB.Characteristic>, arg: CharacteristicValue) => any): HB.Characteristic {
	let tfunc = func;
	if (converter) {
		console.log('Converter added');
		tfunc = (arg: T) => func(converter(character, arg));
	}
	const cfunc = addSetCallback<T>(tfunc);

	return character.on(CharacteristicEventTypes.SET, cfunc);
}

export function toCelsius(temp: number): any {
	return ((temp - 32.0) * 5.0) / 9.0;
}
export function toFahrenheit(temp: number): any {
	return Math.round((temp * 9.0) / 5.0 + 32.0);
}

// export function onGetAsync<T>(character: characteristic.Characteristic, func: (arg: CharacteristicValue) => Promise<T>): characteristic.Characteristic {

// 	const cfunc = addGetCallback(func)

// 	return character.on(CharacteristicEventTypes.GET, cfunc);
// }


export function onGet<T extends CharacteristicValue>(character: HB.Characteristic, func: () => T): HB.Characteristic {

	const cfunc = (cb: CharacteristicGetCallback) => {
		cb(null, func());
	};

	return character.on(CharacteristicEventTypes.GET, cfunc);
}

type T = typeof Characteristic;

// tslint:disable-next-line: new-parens
export function isType<K extends WithUUID<{new ():HB.Characteristic}>>(instance: HB.Characteristic, characteristic: K)
{
	return characteristic && (instance instanceof characteristic || (instance as any).UUID === (characteristic as any).UUID);
}

// declare module 'homebridge/node_modules/homebridge/node_modules/hap-nodejs/dist/lib/Service' {

// 	export interface Service {

// 		updateCharacteristic<T extends WithUUID<typeof characteristic.Characteristic>>(name: T, value: CharacteristicValue): void;

// 	}

// }

export interface LoggerLike extends Partial<log4js.Logger> {
	prefix?: string;
	(msg: any): void;
	default(msg: any): void;

}

declare module 'homebridge/lib/platformAccessory' {
	export interface PlatformAccessory {
		getOrAddService<T extends WithUUID<typeof Service>>(service: T): Service;

	}
}

declare module 'homebridge/lib/logger' {
	// tslint:disable-next-line: no-empty-interface
	export interface Logger extends LoggerLike {

	}

	// tslint:disable-next-line: no-empty-interface
	export interface Logging extends LoggerLike {

	}
}

declare module 'hap-nodejs/dist/lib/Characteristic' {
	export interface Characteristic {
		onSet<T extends CharacteristicValue>(func: (...args: any) => Promise<T>, converter?: (char: HB.Characteristic, arg: CharacteristicValue) => any): HB.Characteristic;
		onGet<T extends CharacteristicValue>(func: () => T | Promise<T>, converter?: (char: HB.Characteristic, arg: CharacteristicValue) => any): HB.Characteristic;

	}
}

export function clone(logger: Logging, prefix: string): Logging {

	const copy1 = { ...logger };
	copy1.prefix = copy1.prefix = prefix ?? logger.prototype;

	const copy = logger.info.bind(copy1) as Logging;
	Object.assign(copy, logger);
	copy.prefix = prefix ?? logger.prefix;

	copy.isDebugEnabled = () => ISYPlatform.Instance.debugLoggingEnabled;

	copy.isErrorEnabled = () => true;

	copy.isWarnEnabled = () => true;

	copy.isFatalEnabled = () => true;

	copy.isTraceEnabled = () => true;

	// copy._log = logger._log.bind(copy);
	copy.debug = logger.debug.bind(copy);
	// copy.fatal = logger..bind(copy);
	copy.info = logger.info.bind(copy);
	copy.error = logger.error.bind(copy);
	copy.warn = logger.warn.bind(copy);

	copy.trace = ((message: ConcatArray<string>, ...args: any[]) => {
		// onst newMsg = chalk.dim(msg);
		if (copy.isTraceEnabled) {
			copy.log.apply(this, ['trace'].concat(message).concat(args));
		}
	}).bind(copy);

	copy.fatal = ((message: ConcatArray<string>, ...args: any[]) => {
		// onst newMsg = chalk.dim(msg);
		if (logger?.isFatalEnabled) {
			logger.log.apply(this, ['fatal'].concat(message).concat(args));
		}
	}).bind(copy);

	return copy;

}

export function wire(logger: Logging) {

	logger.isDebugEnabled = () => ISYPlatform.Instance.debugLoggingEnabled;

	logger.isErrorEnabled = () => true;

	logger.isWarnEnabled = () => true;

	logger.isFatalEnabled = () => true;

	logger.isTraceEnabled = () => true;

	logger.trace = ((message, ...args: any[]) => {
		// onst newMsg = chalk.dim(msg);
		if (logger.isTraceEnabled()) {
			logger.log.apply(this, ['trace'].concat(message).concat(args));
		}
	}).bind(logger);

	logger.fatal = ((message, ...args: any[]) => {
		// onst newMsg = chalk.dim(msg);
		if (logger.isFatalEnabled()) {
			logger.log.apply(this, ['fatal'].concat(message).concat(args));
		}
	}).bind(logger);

}

// tslint:disable-next-line: only-arrow-functions

// (service.Service.prototype as any).changeCharacteristic = (name: WithUUID<typeof Characteristic>, value: CharacteristicValue) => {

// 	const t = this as unknown as service.Service;
// 	t.getCharacteristic(name).updateValue(value);
// };

Promise.prototype.handleWith = async function <T extends CharacteristicValue>(callback: CharacteristicGetCallback | CharacteristicSetCallback): Promise<void> {
	return (this as Promise<T>).then((value) => {
		callback(null, value);
	}, (msg) => {
		callback(new Error(msg), msg);
	});
};

export function addGetCallback<T extends CharacteristicValue>(func: (...args: any[]) => Promise<T>): (arg: any, cb: CharacteristicGetCallback) => void {

	return (arg: any, cb: CharacteristicGetCallback) => {
		// assumption is function has signature of (val, callback, args..)

		try {

			func(arg).handleWith(cb);
		} catch {
			throw new Error('Last argument of callback is not a function.');
		}

	};

}

export function addSetCallback<T extends CharacteristicValue>(func: (arg: T) => Promise<any>): (arg: T, cb: CharacteristicSetCallback) => void {

	return (arg: T, cb: CharacteristicSetCallback) => {
		// assumption is function has signature of (val, callback, args..)

		// const n = newArgs[1];

		try {

			func(arg).handleWith(cb);
		} catch (e)
		{
			throw e;
		}

	};

}

export function addCallback<T>(func: (...args: any[]) => Promise<T>): (arg: any, cb: CharacteristicSetCallback) => void {

	return (arg: any, cb: CharacteristicSetCallback) => {
		// assumption is function has signature of (val, callback, args..)
		console.log('entering new function');
		console.log(arg);

		// const n = newArgs[1];

		try {
			console.log(func);
			console.log(cb);
			func(arg).handleWith(cb);
		} catch {
			throw new Error('Last argument of callback is not a function.');
		}

	};

}
