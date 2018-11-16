import { ILogger, LoggerFactory } from "../src";
import { ConsoleAppender } from "../src/appenders/console-appender";
import { ILogEntry } from "../src/i-log-entry";
import { ELevel } from "../src/e-level";

export class ConsoleAppenderTest extends ConsoleAppender {
    public static messages: ILogEntry[] = [];
    public static messagesDisabled: ILogEntry[] = [];
    public static messagesError: ILogEntry[] = [];
    public static messagesWarn: ILogEntry[] = [];
    public static messagesInfo: ILogEntry[] = [];
    public static messagesDebug: ILogEntry[] = [];

    public static reset(): void {
        ConsoleAppenderTest.messages.length = 0;
        ConsoleAppenderTest.messagesDisabled.length = 0;
        ConsoleAppenderTest.messagesError.length = 0;
        ConsoleAppenderTest.messagesWarn.length = 0;
        ConsoleAppenderTest.messagesInfo.length = 0;
        ConsoleAppenderTest.messagesDebug.length = 0;
    }

    protected write(log: ILogEntry): void {
        ConsoleAppenderTest.messages.push(log);
        switch (log.level) {
            case ELevel.DISABLED:
                ConsoleAppenderTest.messagesDisabled.push(log);
                break;
            case ELevel.ERROR:
                ConsoleAppenderTest.messagesError.push(log);
                break;
            case ELevel.WARN:
                ConsoleAppenderTest.messagesWarn.push(log);
                break;
            case ELevel.INFO:
                ConsoleAppenderTest.messagesInfo.push(log);
                break;
            case ELevel.DEBUG:
                ConsoleAppenderTest.messagesDebug.push(log);
                break;
        }
    }
}
describe("Check global logger - General logging", () => {

    beforeEach(() => {
        LoggerFactory.registerAppender("CONSOLE_TEST", ConsoleAppenderTest);
        LoggerFactory.INSTANCE.configuration = {
            appenders: {
                CONSOLE: {
                    className: "CONSOLE_TEST",
                    level: ELevel.DEBUG,
                    options: {}
                }
            },
            categories: {
                "*": {
                    appenders: ["CONSOLE"],
                    level: ELevel.DEBUG
                }
            }
        };
    });
    const LOGGER: ILogger = LoggerFactory.getLogger("logger.tests.full");

    const testLevel = (level: ELevel) => {
        ConsoleAppenderTest.reset();
        const before = Date.now();
        switch (level) {
            case ELevel.ERROR:
                LOGGER.error("Erreur: %1", "Noooooooooooooooon");
                break;
            case ELevel.WARN:
                LOGGER.warn("Erreur: %1", "Noooooooooooooooon");
                break;
            case ELevel.INFO:
                LOGGER.info("Erreur: %1", "Noooooooooooooooon");
                break;
            case ELevel.DEBUG:
                LOGGER.debug("Erreur: %1", "Noooooooooooooooon");
                break;
        }
        const after = Date.now();
        expect(ConsoleAppenderTest.messages.length).toBe(1, "Check how messages was writen");
        if (ConsoleAppenderTest.messages.length >= 1) {
            expect(ConsoleAppenderTest.messages[0].level).toBe(level, "Check level message");
            expect(ConsoleAppenderTest.messages[0].message).toBe("Erreur: %1", "Check text message");
            expect(ConsoleAppenderTest.messages[0].package).toBe("logger.tests.full", "Check package message");
            expect(ConsoleAppenderTest.messages[0].time).toBeGreaterThanOrEqual(before, "Check level message");
            expect(ConsoleAppenderTest.messages[0].time).toBeLessThanOrEqual(after, "Check time message");
            expect(ConsoleAppenderTest.messages[0].args.length).toBe(1, "Check nb args message");
            if (ConsoleAppenderTest.messages[0].args.length >= 1) {
                expect(ConsoleAppenderTest.messages[0].args[0]).toBe("Noooooooooooooooon", "Check args message");
            }
            for (const key in ConsoleAppenderTest.messages[0].context) {
                expect(key).toBe("", "Check context message");
            }
        }
    };

    it("Check error log", () => {
        testLevel(ELevel.ERROR);
    });

    it("Check warn log", () => {
        testLevel(ELevel.WARN);
    });

    it("Check info log", () => {
        testLevel(ELevel.INFO);
    });

    it("Check debug log", () => {
        testLevel(ELevel.DEBUG);
    });
});

describe("Check global logger - misc", () => {
    it("When i define a subpackage whith lower log level, i don't log messages", () => {
        LoggerFactory.registerAppender("CONSOLE_TEST", ConsoleAppenderTest);
        LoggerFactory.INSTANCE.configuration = {
            appenders: {
                CONSOLE_TEST: {
                    className: "CONSOLE_TEST",
                    level: ELevel.DEBUG,
                    options: {}
                }
            },
            categories: {
                "*": {
                    appenders: ["CONSOLE_TEST"],
                    level: ELevel.DEBUG
                },
                "subpackage": {
                    appenders: ["CONSOLE_TEST"],
                    level: ELevel.INFO
                },
                "subpackage.toto.titi": {
                    appenders: ["CONSOLE_TEST"],
                    level: ELevel.ERROR
                }
            }
        };

        const loggerTest: ILogger = LoggerFactory.getLogger("logger.test");
        const loggerSubpackage: ILogger = LoggerFactory.getLogger("subpackage.test");
        const loggerSubpackageTotoTiti: ILogger = LoggerFactory.getLogger("subpackage.toto.titi");

        ConsoleAppenderTest.reset();
        loggerTest.debug("Test message");
        expect(ConsoleAppenderTest.messages.length).toBe(1, "Check if message from LOGGERTest is logged when debug");

        ConsoleAppenderTest.reset();
        loggerSubpackage.debug("Test message");
        expect(ConsoleAppenderTest.messages.length).toBe(0, "Check if message from LOGGERSubpackage is logged when debug");

        ConsoleAppenderTest.reset();
        loggerSubpackageTotoTiti.debug("Test message");
        expect(ConsoleAppenderTest.messages.length).toBe(0, "Check if message from LOGGERSubpackageTotoTiti is logged when debug");

        ConsoleAppenderTest.reset();
        loggerSubpackage.info("Test message");
        expect(ConsoleAppenderTest.messages.length).toBe(1, "Check if message from LOGGERSubpackage is logged when info");

        ConsoleAppenderTest.reset();
        loggerSubpackageTotoTiti.info("Test message");
        expect(ConsoleAppenderTest.messages.length).toBe(0, "Check if message from LOGGERSubpackageTotoTiti is logged when info");

        ConsoleAppenderTest.reset();
        loggerSubpackageTotoTiti.warn("Test message");
        expect(ConsoleAppenderTest.messages.length).toBe(0, "Check if message from LOGGERSubpackageTotoTiti is logged when warn");

        ConsoleAppenderTest.reset();
        loggerSubpackageTotoTiti.error("Test message");
        expect(ConsoleAppenderTest.messages.length).toBe(1, "Check if message from LOGGERSubpackageTotoTiti is logged when error");
    });
});
