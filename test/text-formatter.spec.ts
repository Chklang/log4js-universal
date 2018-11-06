import { TextFormatter } from "../src";
import { ELevel } from "../src/e-level";

describe("Check TextFormatter", () => {

    it("Check default date format", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("%d");
        const date: Date = new Date();
        date.setFullYear(2015);
        date.setMonth(9);
        date.setDate(21);
        date.setHours(16);
        date.setMinutes(29);
        date.setSeconds(1);
        date.setMilliseconds(123);
        const result: any[] = textFormatter.format({
            args: null,
            context: null,
            level: null,
            message: null,
            package: null,
            time: date.getTime()
        });
        expect(result).toEqual(["2015", "/", "10", "/", "21", " ", "16", ":", "29", ":", "01", ".", "123"], "Check format");
    });

    it("Check date - all possibilities formats", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("%d{> yyyy-yy-MM-M-dd-d-HH-H-mm-m-ss-s-SSS-S <}");
        const date: Date = new Date();
        date.setFullYear(2000);
        date.setMonth(0);
        date.setDate(2);
        date.setHours(3);
        date.setMinutes(4);
        date.setSeconds(5);
        date.setMilliseconds(6);
        const result: any[] = textFormatter.format({
            args: null,
            context: null,
            level: null,
            message: null,
            package: null,
            time: date.getTime()
        });
        expect(result).toEqual(["> ", "2000", "-", "00", "-", "01", "-", "1", "-", "02", "-", "2", "-", "03", "-", "3", "-",
            "04", "-", "4", "-", "05", "-", "5", "-", "006", "-", "6", " <"], "Check format");
    });

    it("Check package name", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("%M");
        const result: any[] = textFormatter.format({
            args: null,
            context: null,
            level: null,
            message: null,
            package: "package",
            time: null
        });
        expect(result).toEqual(["package"], "Check format");
    });

    it("Check level", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("%p");
        const result: any[] = textFormatter.format({
            args: null,
            context: null,
            level: ELevel.ERROR,
            message: null,
            package: null,
            time: null
        });
        expect(result).toEqual(["ERROR"], "Check format");
    });

    it("Check message", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("%m");
        const result: any[] = textFormatter.format({
            args: ["message"],
            context: null,
            level: null,
            message: "Test %1",
            package: null,
            time: null
        });
        expect(result).toEqual(["Test ", "message"], "Check format");
    });

    it("Check breakline", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("%n");
        const result: any[] = textFormatter.format({
            args: null,
            context: null,
            level: null,
            message: null,
            package: null,
            time: null
        });
        expect(result).toEqual(["\r\n"], "Check format");
    });

    it("Check mdc", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("%X{key}");
        const result: any[] = textFormatter.format({
            args: null,
            context: { key: "value" },
            level: null,
            message: null,
            package: null,
            time: null
        });
        expect(result).toEqual(["value"], "Check format");
    });

    it("Check default text", () => {
        const textFormatter: TextFormatter = TextFormatter.generateFormatter("Hello %% world");
        const result: any[] = textFormatter.format({
            args: null,
            context: { key: "value" },
            level: null,
            message: null,
            package: null,
            time: null
        });
        expect(result).toEqual(["Hello % world"], "Check format");
    });
});
