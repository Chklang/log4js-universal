import { Logger } from "./logger";
import { IConfiguration } from "./i-configuration";
import { ILogger } from "./i-logger";
import { IAppender } from "./i-appender";
import { IGlobalContext } from "./i-global-context";
import { DEFAULT_CONFIGURATION } from "./default-configuration";
import { GlobalContext } from "./global-context";
import { ELevel } from "./e-level";

declare var process: any;

export class LoggerFactory implements IGlobalContext {

    public static get INSTANCE(): LoggerFactory {
        let globalObject: LoggerFactory = GlobalContext.get("LOGGERS_FACTORY");

        if (!globalObject) {
            globalObject = new LoggerFactory();
            globalObject.init();
            GlobalContext.set("LOGGERS_FACTORY", globalObject);
        }
        return globalObject;
    }

    public static getLogger(packageName: string): ILogger {
        if (LoggerFactory.INSTANCE._loggers["_logger_" + packageName]) {
            return LoggerFactory.INSTANCE._loggers["_logger_" + packageName];
        }
        const logger: Logger = new Logger(packageName, LoggerFactory.INSTANCE);
        logger.reCalculateConfiguration(LoggerFactory.INSTANCE._configuration);
        LoggerFactory.INSTANCE._loggers.push(logger);
        LoggerFactory.INSTANCE._loggers["_" + packageName] = logger;
        return logger;
    }

    public static registerAppender(name: string, appender: { new(name: string): IAppender }): void {
        LoggerFactory.INSTANCE._registerAppender(name, appender);
    }

    private _configuration: IConfiguration = null;
    private _loggers: Logger[] = [];
    private _appenders: { [key: string]: { new(name: string): IAppender } } = {};
    private _appendersInstances: { [key: string]: IAppender } = {};
    private _mdc: { [key: string]: string } = {};
    private _flash: { [key: string]: string } = {};
    private _missingAppenders: { [key: string]: boolean } = {};

    private constructor() {
    }

    public get configuration(): IConfiguration {
        if (this._missingAppenders !== null) {
            return null;
        }
        return this._configuration;
    }

    public set configuration(configuration: IConfiguration) {
        this._configuration = configuration;

        this.checkIfMissingAppender();
        this.recalculateConfs();
    }

    public createAppender(name: string, appenderClass: string): IAppender {
        if (!this._appenders[appenderClass]) {
            return;
        }
        const appenderInstance: IAppender = new (this._appenders[appenderClass])(name);
        this._appendersInstances[name] = appenderInstance;
        appenderInstance.reCalculateConfiguration(this._configuration);

        return appenderInstance;
    }

    public setMDC(key: string, value: string): void {
        this._mdc[key] = value;
    }

    public setFlash(key: string, value: string): void {
        this._flash[key] = value;
    }

    public removeMDC(key: string): void {
        delete this._mdc[key];
    }
    public removeFlash(key: string): void {
        delete this._flash[key];
    }

    public clearMDC(): void {
        this._mdc = {};
    }
    public clearFlash(): void {
        this._flash = {};
    }
    public getContext(): { [key: string]: string } {
        const result: { [key: string]: string } = {};
        for (const key in this._mdc) {
            result[key] = this._mdc[key];
        }
        for (const key in this._flash) {
            result[key] = this._flash[key];
        }
        return result;
    }
    public getContextAndClearFlash(): { [key: string]: string } {
        const context: { [key: string]: string } = this.getContext();
        this.clearFlash();
        return context;
    }

    private init(): void {
        this.loadConfiguration();
    }

    private checkIfMissingAppender(): void {
        let hasMissingAppenders: boolean = false;
        this._missingAppenders = {};
        for (const appenderName in this._configuration.appenders) {
            if (!this._appenders[this._configuration.appenders[appenderName].className]) {
                this._missingAppenders[this._configuration.appenders[appenderName].className] = true;
                hasMissingAppenders = true;
            }
        }
        if (!hasMissingAppenders) {
            this._missingAppenders = null;
        }
    }

    private recalculateConfs(): void {
        if (this._missingAppenders !== null) {
            return;
        }

        this._loggers.forEach((loggerInstance: Logger) => {
            loggerInstance.reCalculateConfiguration(this._configuration);
        });

        for (const appenderName in this._appendersInstances) {
            this._appendersInstances[appenderName].reCalculateConfiguration(this._configuration);
        }
    }

    private _registerAppender(name: string, appender: { new(name: string): IAppender }): void {
        this._appenders[name] = appender;

        this.checkIfMissingAppender();
        this.recalculateConfs();
    }

    private loadConfiguration(): void {
        const globalConfiguration: IConfiguration = GlobalContext.get("LOGGER_CONFIGURATION");

        // Get from global context
        // tslint:disable-next-line:no-string-literal
        if (globalConfiguration) {
            // tslint:disable-next-line:no-string-literal
            this._configuration = globalConfiguration;
        }

        // Get from environment variables
        if (!this._configuration) {
            try {// Ignore if process isn't defined
                // tslint:disable-next-line:no-string-literal
                if (process.env["LOGGER_CONFIGURATION"]) {
                    // tslint:disable-next-line:no-string-literal
                    this._configuration = JSON.parse(process.env["LOGGER_CONFIGURATION"]);
                }
                // tslint:disable-next-line:no-empty
            } catch (e) { }
        }

        // Generate default configuration
        if (!this._configuration) {
            this._configuration = DEFAULT_CONFIGURATION;
        }

        // Override conf with arguments
        try {
            const regexpAppenders = /^--logger.conf.appenders.([^.]+).level=(.+)$/;
            const regexpCategories = /^--logger.conf.categories.(.+)\.([^=.]+)=(.+)$/;
            process.argv.forEach((arg: string) => {
                if (!/^--logger\.conf/.test(arg)) {
                    return;
                }
                if (regexpAppenders.test(arg)) {
                    const [full, appenderName, level] = regexpAppenders.exec(arg);
                    if (!this._configuration.appenders[appenderName]) {
                        // Appender not found, ignore
                        return;
                    }
                    switch (level) {
                        case ELevel.DEBUG:
                        case ELevel.DISABLED:
                        case ELevel.ERROR:
                        case ELevel.INFO:
                        case ELevel.WARN:
                            this._configuration.appenders[appenderName].level = level as ELevel;
                            break;
                    }
                } else if (regexpCategories.test(arg)) {
                    const [full, categoryName, field, value] = regexpCategories.exec(arg);
                    if (!this._configuration.categories[categoryName]) {
                        this._configuration.categories[categoryName] = {
                            appenders: ["CONSOLE"],
                            level: ELevel.DEBUG
                        };
                    }
                    switch (field) {
                        case "level":
                            switch (value) {
                                case ELevel.DEBUG:
                                case ELevel.DISABLED:
                                case ELevel.ERROR:
                                case ELevel.INFO:
                                case ELevel.WARN:
                                    this._configuration.categories[categoryName].level = value as ELevel;
                                    break;
                            }
                            break;
                        case "appenders":
                            this._configuration.categories[categoryName].appenders = value.split(",");
                            break;
                    }
                }
            });
        } catch (e) {
            // Ignore
        }

        this.checkIfMissingAppender();
        this.recalculateConfs();
    }
}
