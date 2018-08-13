import { IAppender } from "../i-appender";
import { IConfiguration } from "../i-configuration";
import { ELevel } from "../e-level";
import { LoggerHelper } from "../logger-helper";
import { ILogEntry } from "../i-log-entry";

export abstract class AbstractAppender implements IAppender {
    private levelMax: ELevel = null;

    public constructor(protected appenderName: string) {
    }

    public append(log: ILogEntry): void {
        if (!LoggerHelper.levelPass(this.levelMax, log.level)) {
            // Ignore log
            return;
        }
        this.write(log);
    }

    public reCalculateConfiguration(configuration: IConfiguration): void {
        const packageNameSplitted: string[] = this.appenderName.split(/\./);
        let levelMaxFound: ELevel = null;
        let precisionMaxLevelFound: number = null;
        for (const key in configuration.appenders) {
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
                if (levelMaxFound === null || LoggerHelper.levelPass(levelMaxFound, configuration.appenders[key].level)) {
                    levelMaxFound = configuration.appenders[key].level;
                    precisionMaxLevelFound = currentPrecision;
                }
            }
        }
        this.levelMax = levelMaxFound || ELevel.DISABLED;
    }

    protected abstract write(log: ILogEntry): void;

}
