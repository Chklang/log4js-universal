import { ELevel } from "./e-level";

export interface ILogEntry {
    level: ELevel;
    time: number;
    package: string;
    message: string;
    args: any[];
    context: {[key: string]: any};
}
