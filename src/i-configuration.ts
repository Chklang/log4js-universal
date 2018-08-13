import { ELevel } from "./e-level";

export interface IConfiguration {
    appenders: IAppendersConfiguration;
    categories: ICategoriesConfiguration;
}

export interface ICategoriesConfiguration {
    [key: string]: ICategorieConfiguration;
}

export interface ICategorieConfiguration {
    level: ELevel;
    appenders: string[];
}

export interface IAppendersConfiguration {
    [key: string]: IAppenderConfiguration;
}

export interface IAppenderConfiguration {
    className: string;
    level: ELevel;
    options?: any;
}
