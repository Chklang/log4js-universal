import { TextFormatter, AbstractAppender } from "../src";
import { ELevel } from "../src/e-level";
import { ILogEntry } from "../src/i-log-entry";

class AppenderTests extends AbstractAppender {
    public constructor(private writer: (log: ILogEntry) => void) {
        super("AppenderTests");
        // Force for tests the log level
        // tslint:disable-next-line:no-string-literal
        this["levelMax"] = ELevel.DEBUG;
    }
    protected write(log: ILogEntry): void {
        this.writer(log);
    }
}
describe("Check appenders", () => {

    it("Check text with params => Function ok", () => {
        let writerIsCalled: boolean = false;
        const appender = new AppenderTests((log: ILogEntry) => {
            writerIsCalled = true;
            expect(log.args.length).toBe(1, "Check length of arguments");
            expect(log.args[0]).toBe("toto", "Check if first argument (function) is resolved");
        });
        appender.append({
            args: [() => "toto"],
            context: {},
            level: ELevel.INFO,
            message: "titi",
            package: "tests",
            time: Date.now()
        });
        expect(writerIsCalled).toBe(true, "Check if writer is called");
    });

    it("Check text with params => Function error", () => {
        let writerIsCalled: boolean = false;
        const appender = new AppenderTests((log: ILogEntry) => {
            writerIsCalled = true;
            expect(log.args.length).toBe(1, "Check length of arguments");
            expect(log.args[0]).toBe("<CANNOT CALL LOG ARGUMENT 0 : Error: toto>", "Check if first argument (function) is resolved");
        });
        appender.append({
            args: [() => { throw new Error("toto"); }],
            context: {},
            level: ELevel.INFO,
            message: "titi",
            package: "tests",
            time: Date.now()
        });
        expect(writerIsCalled).toBe(true, "Check if writer is called");
    });

    it("Check text with params => Object to serialize", () => {
        let writerIsCalled: boolean = false;
        const objectArg = {
            foo: "bar"
        };
        const appender = new AppenderTests((log: ILogEntry) => {
            writerIsCalled = true;
            expect(log.args.length).toBe(1, "Check length of arguments");
            expect(log.args[0]).toBe(objectArg, "Check if first argument (object) is serialized");
        });
        appender.append({
            args: [() => objectArg],
            context: {},
            level: ELevel.INFO,
            message: "titi",
            package: "tests",
            time: Date.now()
        });
        expect(writerIsCalled).toBe(true, "Check if writer is called");
    });
});
