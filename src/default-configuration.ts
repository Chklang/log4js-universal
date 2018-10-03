import { IConfiguration, IAppendersConfiguration } from "./i-configuration";
import { ELevel } from "./e-level";

const appenders: IAppendersConfiguration = {};
appenders.CONSOLE = {
    className: "ConsoleAppender",
    level: ELevel.DEBUG
};
export const DEFAULT_CONFIGURATION: IConfiguration = {
    appenders: appenders,
    categories: {
        "*": {
            level: ELevel.INFO,
            appenders: ["CONSOLE"]
        }
    }
};
