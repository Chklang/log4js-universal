declare var global: any;
declare var window: any;

export class GlobalContext {
    public static get<T>(name: string): T {
        return GlobalContext.getContext()[name];
    }
    public static set<T>(name: string, value: T): void {
        GlobalContext.getContext()[name] = value;
    }

    private static context: any = null;
    private static getContext(): any {
        if (GlobalContext.context) {
            return GlobalContext.context;
        }

        try {
            GlobalContext.context = global;
            return GlobalContext.context;
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            GlobalContext.context = window;
            return GlobalContext.context;
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        return {};
    }
}
