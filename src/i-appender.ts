import { ILogEntry } from "./i-log-entry";
import { IConfiguration } from "./i-configuration";

export interface IAppender {
    append(log: ILogEntry): void;
    reCalculateConfiguration(configuration: IConfiguration): void;
}
