import { ILogEntry } from "./i-log-entry";

export class TextFormatter {
    public static generateFormatter(formatter: string): TextFormatter {
        const functionsFormat: Array<(logEntry: ILogEntry) => string> = [];
        let currentString: string = null;
        for (let i = 0; i < formatter.length; i++) {
            if (formatter[i] !== "%") {
                if (currentString === null) {
                    currentString = formatter[i];
                } else {
                    currentString += formatter[i];
                }
                continue;
            }
            i++;
            let symbol: string = "";
            const regexpTypeProperty: RegExp = /^[a-zA-Z]$/;
            while (i < formatter.length && regexpTypeProperty.test(formatter[i])) {
                symbol += formatter[i];
                i++;
            }
            if (symbol.length === 0 && formatter[i] === "%") {
                currentString += "%";
                continue;
            }

            if (currentString !== null) {
                functionsFormat.push(TextFormatter.addFormatterText(currentString));
                currentString = null;
            }
            let details: string = "";
            if (formatter[i] === "{") {
                // Details
                i++;
                while (i < formatter.length && formatter[i] !== "}") {
                    details += formatter[i];
                    i++;
                }
                i++;
            }
            i--;
            switch (symbol) {
                case "d": {
                    if (!details) {
                        details = "yyyy/MM/dd HH:mm:ss.SSS";
                    }
                    functionsFormat.push(TextFormatter.addFormatterDate(details));
                    break;
                }
                case "M": {
                    functionsFormat.push(TextFormatter.addFormatterPackageName());
                    break;
                }
                case "p": {
                    functionsFormat.push(TextFormatter.addFormatterLevel());
                    break;
                }
                case "m": {
                    functionsFormat.push(TextFormatter.addFormatterMessage());
                    break;
                }
                case "n": {
                    functionsFormat.push(TextFormatter.addFormatterBreakline());
                    break;
                }
                case "X": {
                    if (details) {
                        functionsFormat.push(TextFormatter.addFormatterMdc(details));
                    }
                    break;
                }
            }
        }

        if (currentString !== null) {
            functionsFormat.push(TextFormatter.addFormatterText(currentString));
            currentString = null;
        }
        return new TextFormatter(functionsFormat);
    }

    private static addFormatterText(text: string): () => string {
        return () => {
            return text;
        };
    }
    private static addFormatterLevel(): (logEntry: ILogEntry) => string {
        return (logEntry: ILogEntry) => {
            return logEntry.level;
        };
    }
    private static addFormatterPackageName(): (logEntry: ILogEntry) => string {
        return (logEntry: ILogEntry) => {
            return logEntry.package;
        };
    }
    private static addFormatterMessage(): (logEntry: ILogEntry) => string {
        return (logEntry: ILogEntry) => {
            return TextFormatter.calculateMessage(logEntry.message, logEntry.args);
        };
    }
    private static addFormatterBreakline(): () => string {
        return () => {
            return "\r\n";
        };
    }
    private static addFormatterMdc(mdcName: string): (logEntry: ILogEntry) => string {
        return (logEntry: ILogEntry) => {
            return logEntry.context[mdcName];
        };
    }
    private static addFormatterDate(format: string): (logEntry: ILogEntry) => string {
        const result: Array<(date: Date) => string | number> = [];
        let currentText: string = null;
        for (let i = 0; i < format.length; i++) {
            let isSpecialChar: boolean = true;
            let formatterToAdd: (date: Date) => string | number = null;
            let nbletters: number = null;
            switch (format[i]) {
                case "y": {
                    nbletters = TextFormatter.getSameLetters(format, i);
                    switch (nbletters) {
                        case 1:
                            formatterToAdd = TextFormatter.addFormatterDateYear1();
                            break;
                        case 2:
                            formatterToAdd = TextFormatter.addFormatterDateYear2();
                            break;
                        case 4:
                            formatterToAdd = TextFormatter.addFormatterDateYear4();
                            break;
                    }
                    break;
                }
                case "M": {
                    nbletters = TextFormatter.getSameLetters(format, i);
                    switch (nbletters) {
                        case 1:
                            formatterToAdd = TextFormatter.addFormatterDateMonth1();
                            break;
                        case 2:
                            formatterToAdd = TextFormatter.addFormatterDateMonth2();
                            break;
                    }
                    break;
                }
                case "d": {
                    nbletters = TextFormatter.getSameLetters(format, i);
                    switch (nbletters) {
                        case 1:
                            formatterToAdd = TextFormatter.addFormatterDateDay1();
                            break;
                        case 2:
                            formatterToAdd = TextFormatter.addFormatterDateDay2();
                            break;
                    }
                    break;
                }
                case "H": {
                    nbletters = TextFormatter.getSameLetters(format, i);
                    switch (nbletters) {
                        case 1:
                            formatterToAdd = TextFormatter.addFormatterDateHour1();
                            break;
                        case 2:
                            formatterToAdd = TextFormatter.addFormatterDateHour2();
                            break;
                    }
                    break;
                }
                case "m": {
                    nbletters = TextFormatter.getSameLetters(format, i);
                    switch (nbletters) {
                        case 1:
                            formatterToAdd = TextFormatter.addFormatterDateMinutes1();
                            break;
                        case 2:
                            formatterToAdd = TextFormatter.addFormatterDateMinutes2();
                            break;
                    }
                    break;
                }
                case "s": {
                    nbletters = TextFormatter.getSameLetters(format, i);
                    switch (nbletters) {
                        case 1:
                            formatterToAdd = TextFormatter.addFormatterDateSeconds1();
                            break;
                        case 2:
                            formatterToAdd = TextFormatter.addFormatterDateSeconds2();
                            break;
                    }
                    break;
                }
                case "S": {
                    nbletters = TextFormatter.getSameLetters(format, i);
                    switch (nbletters) {
                        case 1:
                            formatterToAdd = TextFormatter.addFormatterDateMilliseconds1();
                            break;
                        case 3:
                            formatterToAdd = TextFormatter.addFormatterDateMilliseconds3();
                            break;
                    }
                    break;
                }
                default: {
                    isSpecialChar = false;
                }
            }
            if (!isSpecialChar || !formatterToAdd) {
                if (currentText === null) {
                    currentText = format[i];
                } else {
                    currentText += format[i];
                }
            }
            if (formatterToAdd) {
                if (currentText !== null) {
                    result.push(TextFormatter.addFormatterText(currentText));
                    currentText = null;
                }
                result.push(formatterToAdd);
                i += nbletters - 1;
            }
        }
        if (currentText !== null) {
            result.push(TextFormatter.addFormatterText(currentText));
            currentText = null;
        }
        return (log: ILogEntry) => {
            const date = new Date(log.time);
            return result.map((callback: (date: Date) => string | number) => {
                return callback(date).toString();
            }).join("");
        };
    }

    private static setLength(str: string | number, toLength: number, char: string): string {
        str = str.toString();
        while (str.length < toLength) {
            str = char + str;
        }
        return str;
    }

    private static addFormatterDateYear1(): (date: Date) => string | number {
        return (date: Date) => {
            return date.getFullYear();
        };
    }
    private static addFormatterDateYear2(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getFullYear() % 100, 2, "0");
        };
    }
    private static addFormatterDateYear4(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getFullYear(), 4, "0");
        };
    }
    private static addFormatterDateMonth1(): (date: Date) => string | number {
        return (date: Date) => {
            return date.getMonth() + 1;
        };
    }
    private static addFormatterDateMonth2(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getMonth() + 1, 2, "0");
        };
    }
    private static addFormatterDateDay1(): (date: Date) => string | number {
        return (date: Date) => {
            return date.getDate();
        };
    }
    private static addFormatterDateDay2(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getDate(), 2, "0");
        };
    }
    private static addFormatterDateHour1(): (date: Date) => string | number {
        return (date: Date) => {
            return date.getHours();
        };
    }
    private static addFormatterDateHour2(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getHours(), 2, "0");
        };
    }
    private static addFormatterDateMinutes1(): (date: Date) => string | number {
        return (date: Date) => {
            return date.getMinutes();
        };
    }
    private static addFormatterDateMinutes2(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getMinutes(), 2, "0");
        };
    }
    private static addFormatterDateSeconds1(): (date: Date) => string | number {
        return (date: Date) => {
            return date.getSeconds();
        };
    }
    private static addFormatterDateSeconds2(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getSeconds(), 2, "0");
        };
    }
    private static addFormatterDateMilliseconds1(): (date: Date) => string | number {
        return (date: Date) => {
            return date.getMilliseconds();
        };
    }
    private static addFormatterDateMilliseconds3(): (date: Date) => string | number {
        return (date: Date) => {
            return TextFormatter.setLength(date.getMilliseconds(), 3, "0");
        };
    }

    private static getSameLetters(text: string, currentIndex: number): number {
        const currentLetter = text[currentIndex];
        let nbLetters: number = 1;
        for (let i = currentIndex + 1; i < text.length && text[i] === currentLetter; i++) {
            nbLetters++;
        }
        return nbLetters;
    }

    private static calculateMessage(text: string, params: any[]): string {
        const errors: Error[] = [];
        text = text.replace(/\%([0-9]+)/g, (str: string, replaceIndex: string) => {
            const index: number = Number(replaceIndex);
            const e = params[index - 1];
            if (e instanceof Error) {
                errors.push(e);
            } else if (typeof e === "object") {
                try {
                    return JSON.stringify(e);
                } catch (e) {
                    return "<Object not stringifiable!>";
                }
            }
            return e;
        });
        errors.forEach((e: Error) => {
            text += "\r\n" + e.stack;
        });
        return text;
    }

    private constructor(private functions: Array<(logEntry: ILogEntry) => string>) {

    }

    public format(logEntry: ILogEntry): string {
        return this.functions.map((callback: (logEntry: ILogEntry) => string) => {
            return callback(logEntry).toString();
        }).join("");
    }
}
