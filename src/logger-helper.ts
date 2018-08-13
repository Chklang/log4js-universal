import { ELevel } from "./e-level";

export class LoggerHelper {
    public static levelPass(reference: ELevel, current: ELevel): boolean {
        return LoggerHelper.levelToNumber(reference) >= LoggerHelper.levelToNumber(current);
    }

    private static levelToNumber(level: ELevel): number {
        switch (level) {
            case ELevel.DISABLED:
                return -1;
            case ELevel.ERROR:
                return 1;
            case ELevel.WARN:
                return 2;
            case ELevel.INFO:
                return 3;
            case ELevel.DEBUG:
                return 4;
        }
    }
}
