import { Logger } from "./logger";
import { IConfiguration, IAppendersConfiguration } from "./i-configuration";
import { ConsoleAppender } from "./appenders/console-appender";
import { ELevel } from "./e-level";
import { ILogger } from "./i-logger";
import { IAppender } from "./i-appender";

declare var global: any;
declare var window: any;
declare var process: any;

export class LoggerFactory {

    public static get INSTANCE(): LoggerFactory {
        const globalObject = LoggerFactory.getGlobalObject();

        // tslint:disable-next-line:no-string-literal
        if (!globalObject["LOGGERS_FACTORY"]) {
            const loggerFactory: LoggerFactory = new LoggerFactory();
            // tslint:disable-next-line:no-string-literal
            globalObject["LOGGERS_FACTORY"] = loggerFactory;
            // tslint:disable-next-line:no-string-literal
            loggerFactory.init();
        }
        // tslint:disable-next-line:no-string-literal
        return globalObject["LOGGERS_FACTORY"];
    }

    public static getLogger(packageName: string): ILogger {
        if (LoggerFactory.INSTANCE._loggers["_logger_" + packageName]) {
            return LoggerFactory.INSTANCE._loggers["_logger_" + packageName];
        }
        const logger: Logger = new Logger(packageName);
        logger.reCalculateConfiguration(LoggerFactory.INSTANCE._configuration);
        LoggerFactory.INSTANCE._loggers.push(logger);
        LoggerFactory.INSTANCE._loggers["_" + packageName] = logger;
        return logger;
    }

    public static registerAppender(name: string, appender: { new(name: string): IAppender }): void {
        LoggerFactory.INSTANCE._appenders[name] = appender;
    }

    private static getGlobalObject() {
        try {
            return global;
            // tslint:disable-next-line:no-empty
        } catch (e) { }
        try {
            return window;
            // tslint:disable-next-line:no-empty
        } catch (e) { }
    }

    private _configuration: IConfiguration = null;
    private _loggers: Logger[] = [];
    private _appenders: { [key: string]: { new(name: string): IAppender } } = {};
    private _appendersInstances: { [key: string]: IAppender } = {};
    private _mdc: { [key: string]: string } = {};
    private _flash: { [key: string]: string } = {};

    private constructor() {
    }

    public get configuration(): IConfiguration {
        return this._configuration;
    }

    public set configuration(configuration: IConfiguration) {
        this._configuration = configuration;
        this._loggers.forEach((loggerInstance: Logger) => {
            loggerInstance.reCalculateConfiguration(configuration);
        });
        for (const appenderName in this._appendersInstances) {
            this._appendersInstances[appenderName].reCalculateConfiguration(configuration);
        }
    }

    public createAppender(name: string, appenderClass: string): IAppender {
        if (!this._appenders[appenderClass]) {
            return;
        }
        const appenderInstance: IAppender = new (this._appenders[appenderClass])(name);
        this._appendersInstances[name] = appenderInstance;
        appenderInstance.reCalculateConfiguration(LoggerFactory.INSTANCE._configuration);
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
    public getContext(): {[key: string]: string} {
        const result: {[key: string]: string} = {};
        for (const key in this._mdc) {
            result[key] = this._mdc[key];
        }
        for (const key in this._flash) {
            result[key] = this._flash[key];
        }
        return result;
    }
    public getContextAndClearFlash(): {[key: string]: string} {
        const context: {[key: string]: string} =  this.getContext();
        this.clearFlash();
        return context;
    }

    private init(): void {
        // Load appenders
        ConsoleAppender.registerIt();

        this.loadConfiguration();
    }

    private loadConfiguration(): void {
        const globalObject = LoggerFactory.getGlobalObject();

        // Get from global context
        // tslint:disable-next-line:no-string-literal
        if (globalObject["LOGGER_CONFIGURATION"]) {
            // tslint:disable-next-line:no-string-literal
            this._configuration = globalObject["LOGGER_CONFIGURATION"];
        }

        // Get from environment variables
        if (!this._configuration) {
            try {
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
            const appenders: IAppendersConfiguration = {};
            appenders.CONSOLE = {
                className: ConsoleAppender.NAME,
                level: ELevel.INFO
            };
            this._configuration = {
                appenders: appenders,
                categories: {
                    "*": {
                        level: ELevel.INFO,
                        appenders: ["CONSOLE"]
                    }
                }
            };
        }
    }
}
