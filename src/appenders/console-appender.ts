import { ILogEntry } from "../i-log-entry";
import { ELevel } from "../e-level";
import { AbstractAppender } from "./abstract-appender";
import { LoggerFactory } from "../logger-factory";
import { IConfiguration, IAppenderConfiguration } from "../i-configuration";
import { TextFormatter } from "../text-formatter";

export class ConsoleAppender extends AbstractAppender {
    public static get NAME(): string {
        return "ConsoleAppender";
    }
    private static LOGGER = LoggerFactory.getLogger("loggers.appenders.ConsoleAppender");

    public logMethod: (...args: any[]) => void = null;

    private formatter: TextFormatter = null;
    private stringify: boolean = false;

    public reCalculateConfiguration(configuration: IConfiguration): void {
        super.reCalculateConfiguration(configuration);

        // Recalculate formater
        const confAppender: IAppenderConfiguration = configuration.appenders[this.appenderName];
        if (!confAppender) {
            // Appender configuration not found!
            return;
        }
        let formatter = null;
        if (confAppender.options && confAppender.options.formatter) {
            formatter = confAppender.options.formatter;
        } else {
            formatter = "%d{yyyy/MM/dd HH:mm:ss.SSS} [%M] %p - %m";
        }
        if (confAppender.options && confAppender.options.stringify === true) {
            this.stringify = true;
        }
        this.formatter = TextFormatter.generateFormatter(formatter);
    }
    protected write(log: ILogEntry): void {
        let consoleMethod: (...args: any[]) => void = this.logMethod;
        if (consoleMethod === null) {
            switch (log.level) {
                case ELevel.ERROR:
                    // tslint:disable-next-line:no-console
                    consoleMethod = console.error;
                    break;
                case ELevel.WARN:
                    // tslint:disable-next-line:no-console
                    consoleMethod = console.warn;
                    break;
                case ELevel.INFO:
                    // tslint:disable-next-line:no-console
                    consoleMethod = console.info;
                    break;
                case ELevel.DEBUG:
                    // tslint:disable-next-line:no-console
                    consoleMethod = console.debug;
                    break;
                default:
                    ConsoleAppender.LOGGER.error("Cannot write log %1, level %2 isn't implemented", log.message, log.level);
                    return;
            }
        }

        if (this.stringify) {
            consoleMethod.call(console, this.formatter.format(log).map((e, index) => {
                if (e instanceof Object) {
                    try {
                        return JSON.stringify(e);
                    } catch (e) {
                        return "<CANNOT STRINGIFY PARAM " + index + ">";
                    }
                }
                return e;
            }).join(""));
        } else {
            consoleMethod.apply(console, this.formatter.format(log));
        }
    }
}
