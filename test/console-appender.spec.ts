import { TextFormatter } from "../src";
import { ELevel } from "../src/e-level";
import { ConsoleAppender } from "../src/appenders/console-appender";

describe("Check console appender", () => {

    it("Check option stringify = false", () => {
        let writerIsCalled: boolean = false;
        const appender = new ConsoleAppender("CONSOLE-TEST");
        // tslint:disable-next-line:no-string-literal
        appender["formatter"] = TextFormatter.generateFormatter("%m");
        // tslint:disable-next-line:no-string-literal
        appender["levelMax"] = ELevel.DEBUG;
        appender.logMethod = (...args: any[]) => {
            writerIsCalled = true;
            expect(args).toEqual(["toto ", "a", " titi ", "b", " tata"], "Check arguments");
        };
        appender.append({
            args: ["a", "b"],
            context: {},
            level: ELevel.INFO,
            message: "toto %1 titi %2 tata",
            package: "tests",
            time: Date.now()
        });
        expect(writerIsCalled).toBe(true, "Check if writer is called");
    });

    it("Check option stringify = true", () => {
        let writerIsCalled: boolean = false;
        const appender = new ConsoleAppender("CONSOLE-TEST");
        // tslint:disable-next-line:no-string-literal
        appender["formatter"] = TextFormatter.generateFormatter("%m");
        // tslint:disable-next-line:no-string-literal
        appender["levelMax"] = ELevel.DEBUG;
        // tslint:disable-next-line:no-string-literal
        appender["stringify"] = true;
        appender.logMethod = (...args: any[]) => {
            writerIsCalled = true;
            expect(args).toEqual(["toto a titi b tata"], "Check arguments");
        };
        appender.append({
            args: ["a", "b"],
            context: {},
            level: ELevel.INFO,
            message: "toto %1 titi %2 tata",
            package: "tests",
            time: Date.now()
        });
        expect(writerIsCalled).toBe(true, "Check if writer is called");
    });
});
