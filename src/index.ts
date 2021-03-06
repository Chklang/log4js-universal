import { LoggerFactory } from "./logger-factory";
import { ConsoleAppender } from "./appenders/console-appender";

export { LoggerFactory } from "./logger-factory";
export { AbstractAppender } from "./appenders/abstract-appender";
export { IAppender } from "./i-appender";
export { ILogger } from "./i-logger";
export { IConfiguration, IAppendersConfiguration, ICategoriesConfiguration, IAppenderConfiguration, ICategorieConfiguration } from "./i-configuration";
export { TextFormatter } from "./text-formatter";
export { ELevel } from "./e-level";

LoggerFactory.registerAppender(ConsoleAppender.NAME, ConsoleAppender);
