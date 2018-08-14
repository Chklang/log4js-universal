import { IAppender } from "./i-appender";

export interface IGlobalContext {
    getContextAndClearFlash(): {[key: string]: string};
    createAppender(name: string, className: string): IAppender;
}
