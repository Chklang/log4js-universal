import { ELevel } from "./e-level";
import { LoggerFactory } from "./logger-factory";
import { IConfiguration } from "./i-configuration";
import { LoggerHelper } from "./logger-helper";
import { IAppender } from "./i-appender";
import { ILogger } from "./i-logger";

export class Logger implements ILogger {
    private levelMax: ELevel = null;
    private levelByAppenders: Array<{appender: IAppender, level: ELevel}> = [];

    public constructor(private packageName: string) {

    }

    public error(text: string, ...params: any[]): void {
        this.write(ELevel.ERROR, text, ...params);
    }
    public warn(text: string, ...params: any[]): void {
        this.write(ELevel.WARN, text, ...params);
    }
    public info(text: string, ...params: any[]): void {
        this.write(ELevel.INFO, text, ...params);
    }
    public debug(text: string, ...params: any[]): void {
        this.write(ELevel.DEBUG, text, ...params);
    }

    public reCalculateConfiguration(configuration: IConfiguration): void {
        const packageNameSplitted: string[] = this.packageName.split(/\./);
        let levelMaxFound: ELevel = null;
        let precisionMaxLevelFound: number = null;
        this.levelMax = null;
        this.levelByAppenders = [];
        const levelByAppendersFound: {[key: string]: ELevel} = {};
        const precisionLevelByAppendersFound: {[key: string]: number} = {};
        for (const key in configuration.categories) {
            let isPackageParent: boolean = null;
            let currentPrecision: number = null;
            if (key === "*") {
                isPackageParent = true;
                currentPrecision = 0;
            } else {
                const keySplitted: string[] = key.split(/\./);
                isPackageParent = keySplitted.every((keyPart: string, index: number) => {
                    if (packageNameSplitted.length < index) {
                        return false;
                    }
                    return keyPart === packageNameSplitted[index];
                });
                currentPrecision = keySplitted.length;
            }
            if (!isPackageParent) {
                continue;
            }
            if (precisionMaxLevelFound === null || precisionMaxLevelFound < currentPrecision) {
                if (levelMaxFound === null || LoggerHelper.levelPass(levelMaxFound, configuration.categories[key].level)) {
                    levelMaxFound = configuration.categories[key].level;
                    precisionMaxLevelFound = currentPrecision;
                }
            }
            configuration.categories[key].appenders.forEach((appenderName: string) => {
                if (!levelByAppendersFound[appenderName]) {
                    levelByAppendersFound[appenderName] = configuration.categories[key].level;
                    precisionLevelByAppendersFound[appenderName] = currentPrecision;
                } else if (precisionLevelByAppendersFound[appenderName] < currentPrecision && LoggerHelper.levelPass(levelByAppendersFound[appenderName], configuration.categories[key].level)) {
                    levelByAppendersFound[appenderName] = configuration.categories[key].level;
                    precisionLevelByAppendersFound[appenderName] = currentPrecision;
                }
            });

            for (const appenderName in levelByAppendersFound) {
                const appenderClass: string = configuration.appenders[appenderName].className;
                const appenderInstance: IAppender = LoggerFactory.INSTANCE.createAppender(appenderName, appenderClass);
                if (!appenderInstance) {
                    // Ignore
                    continue;
                }
                this.levelByAppenders.push({
                    appender: appenderInstance,
                    level: levelByAppendersFound[appenderName]
                });
            }
        }
        this.levelMax = levelMaxFound || ELevel.DISABLED;
    }

    private write(level: ELevel, message: string, ...args: any[]) {
        if (!LoggerHelper.levelPass(this.levelMax, level)) {
            // Trap message
            return;
        }
        this.levelByAppenders.forEach((appender: {appender: IAppender, level: ELevel}) => {
            if (LoggerHelper.levelPass(appender.level, level)) {
                appender.appender.append({
                    level: level,
                    args: args,
                    context: LoggerFactory.INSTANCE.getContextAndClearFlash(),
                    message: message,
                    package: this.packageName,
                    time: Date.now()
                });
            }
        });
    }
}
