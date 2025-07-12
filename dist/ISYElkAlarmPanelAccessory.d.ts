import './utils';
import { Categories } from 'hap-nodejs';
import { ELKAlarmPanelDevice } from 'isy-nodejs';
import { AlarmMode } from 'isy-nodejs/lib/Devices/Elk/ElkAlarmPanelDevice';
import { ISYAccessory } from './ISYAccessory';
export declare class ISYElkAlarmPanelAccessory extends ISYAccessory<ELKAlarmPanelDevice, Categories.ALARM_SYSTEM> {
    alarmPanelService: any;
    setAlarmTargetState(targetStateHK: any, callback: () => void): void;
    translateAlarmCurrentStateToHK(): 1 | 0 | 2 | 3 | 4;
    translateAlarmTargetStateToHK(): 1 | 0 | 2 | 3;
    translateHKToAlarmTargetState(state: number): AlarmMode.DISARMED | AlarmMode.AWAY | AlarmMode.STAY | AlarmMode.NIGHT;
    getAlarmTargetState(callback: (arg0: null, arg1: number) => void): void;
    getAlarmCurrentState(callback: (arg0: null, arg1: number) => void): void;
    handlePropertyChange(propertyName: string, value: any, oldValue: any, formattedValue: string): void;
    setupServices(): void;
}
//# sourceMappingURL=ISYElkAlarmPanelAccessory.d.ts.map