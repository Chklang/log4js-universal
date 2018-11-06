import { ILogEntry } from "./i-log-entry";

export class TextFormatter {
    public static generateFormatter(formatter: string): TextFormatter {
        const functionsFormat: Array<(logEntry: ILogEntry) => {mustExplode: boolean, content: any}> = [];
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
            const regexpTypeProperty: RegExp = /^[a-zA-Z0-9]$/;
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

    private static addFormatterText(text: string): () => {mustExplode: boolean, content: any} {
        return () => {
            return { mustExplode: false, content: text};
        };
    }
    private static addFormatterLevel(): (logEntry: ILogEntry) => {mustExplode: boolean, content: any} {
        return (logEntry: ILogEntry) => {
            return { mustExplode: false, content: logEntry.level};
        };
    }
    private static addFormatterPackageName(): (logEntry: ILogEntry) => {mustExplode: boolean, content: any} {
        return (logEntry: ILogEntry) => {
            return { mustExplode: false, content: logEntry.package};
        };
    }
    private static addFormatterMessage(): (logEntry: ILogEntry) => {mustExplode: boolean, content: any[]} {
        return (logEntry: ILogEntry) => {
            return { mustExplode: true, content: TextFormatter.calculateMessage(logEntry.message, logEntry.args)};
        };
    }
    private static addFormatterBreakline(): () => {mustExplode: boolean, content: any} {
        return () => {
            return { mustExplode: false, content: "\r\n"};
        };
    }
    private static addFormatterMdc(mdcName: string): (logEntry: ILogEntry) => {mustExplode: boolean, content: any} {
        return (logEntry: ILogEntry) => {
            return { mustExplode: false, content: logEntry.context[mdcName] };
        };
    }
    private static addFormatterDate(format: string): (logEntry: ILogEntry) => {mustExplode: boolean, content: any} {
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
                    result.push(TextFormatter.addFormatterDateText(currentText));
                    currentText = null;
                }
                result.push(formatterToAdd);
                i += nbletters - 1;
            }
        }
        if (currentText !== null) {
            result.push(TextFormatter.addFormatterDateText(currentText));
            currentText = null;
        }
        return (log: ILogEntry) => {
            const date = new Date(log.time);
            const resultFinal = {mustExplode: true, content: []};
            result.forEach((callback: (date: Date) => string | number) => {
                resultFinal.content.push(callback(date).toString());
            });
            return resultFinal;
        };
    }

    private static setLength(str: string | number, toLength: number, char: string): string {
        str = str.toString();
        while (str.length < toLength) {
            str = char + str;
        }
        return str;
    }

    private static addFormatterDateText(text: string): () => string {
        return () => {
            return text;
        };
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
    private static addFormatterArgument(argIndex: number): (logEntry: ILogEntry) => any {
        return (logEntry: ILogEntry) => {
            if (logEntry.args.length <= argIndex) {
                return "<ARGUMENT NUMBER " + argIndex + " NOT EXISTS!";
            }
            return logEntry.args[argIndex];
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

    private static calculateMessage(text: string, params: any[]): any[] {
        const errors: Error[] = [];
        const result = [];
        let lastStartTextIndex: number = 0;
        const regExp = /\%([0-9]+)/g;
        let regExpResult: RegExpExecArray = null;
        // tslint:disable-next-line:no-conditional-assignment
        while (regExpResult = regExp.exec(text)) {
            result.push(text.substring(lastStartTextIndex, regExpResult.index));
            lastStartTextIndex = regExpResult.index + regExpResult[0].length;
            const index: number = Number(regExpResult[1]);
            const e = params[index - 1];
            if (e instanceof Error) {
                errors.push(e);
            }
            result.push(e);
        }
        if (lastStartTextIndex < text.length) {
            result.push(text.substring(lastStartTextIndex));
        }
        errors.forEach((e) => result.push(e));
        return result;
    }

    private constructor(private functions: Array<(logEntry: ILogEntry) => {mustExplode: boolean, content: any}>) {

    }

    public format(logEntry: ILogEntry): any[] {
        const results = [];
        this.functions.forEach((callback: (logEntry: ILogEntry) => {mustExplode: boolean, content: any}) => {
            const result = callback(logEntry);
            if (result.mustExplode) {
                (result.content as any[]).forEach((e) => results.push(e));
            } else {
                results.push(result.content);
            }
            return result;
        });
        return results;
    }
}
