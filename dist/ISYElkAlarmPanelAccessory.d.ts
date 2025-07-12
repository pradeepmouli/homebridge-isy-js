import './utils';
import { Categories } from 'hap-nodejs';
import { ELKAlarmPanelDevice } from 'isy-nodejs';
import { ISYAccessory } from './ISYAccessory';
export declare class ISYElkAlarmPanelAccessory extends ISYAccessory<ELKAlarmPanelDevice, Categories.ALARM_SYSTEM> {
    alarmPanelService: any;
    setAlarmTargetState(targetStateHK: any, callback: () => void): void;
    translateAlarmCurrentStateToHK(): 4 | 3 | 0 | 1 | 2;
    translateAlarmTargetStateToHK(): 3 | 0 | 1 | 2;
    translateHKToAlarmTargetState(state: number): any;
    getAlarmTargetState(callback: (arg0: null, arg1: number) => void): void;
    getAlarmCurrentState(callback: (arg0: null, arg1: number) => void): void;
    handlePropertyChange(propertyName: string, value: any, oldValue: any, formattedValue: string): void;
    setupServices(): void;
}
//# sourceMappingURL=ISYElkAlarmPanelAccessory.d.ts.map