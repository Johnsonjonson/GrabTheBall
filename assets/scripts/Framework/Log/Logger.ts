/**
 * 
 * @FileName: Logger.ts
 * @ClassName: Logger
 * @Author: yafang
 * @CreateDate: Mon May 20 2024 14:31:49 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Log/Logger.ts
 * @Description: 
 *      日志管理类
 */

import { warn, log, error } from "cc";
import { DEBUG } from "cc/env";

enum LogLevel {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4
}

class Logger {

    private _date: Date;
    constructor() {
        this._date = new Date();
    }

    public d(...params: any[]) {
        if(!DEBUG) {
            return;
        }
        let tag = this.getTag(LogLevel.DEBUG);
        log(tag, ...params);
    }

    public i(...params: any[]) {
        if(!DEBUG) {
            return;
        }
        let tag = this.getTag(LogLevel.INFO);
        log(tag, ...params);
    }

    public w(...params: any[]) {
        if(!DEBUG) {
            return;
        }
        let tag = this.getTag(LogLevel.WARN);
        warn(tag, ...params);
    }

    public e(...params: any[]) {
        if(!DEBUG) {
            return;
        }
        let tag = this.getTag(LogLevel.ERROR);
        error(tag, ...params);
    }

    private getTag(level: LogLevel): string {
        this._date.setTime(Date.now())
        let t = this._date.toLocaleTimeString();
        let e: string = this.getCallStack(4);;
        switch(level) {
            case LogLevel.DEBUG:
                return `[${t}]-[${e}]-[DEBUG] : `
            case LogLevel.INFO:
                return `[${t}]-[${e}]-[INFO] : `
            case LogLevel.WARN:
                return `[${t}]-[${e}]-[WARN] : `
            case LogLevel.ERROR:
                return `[${t}]-[${e}]-[ERROR] : `
            default:
                return `[${t}]-[${e}]-[INFO] : `
        }
    }

    private getCallStack(index: number): string {
        let e = new Error();
        let lines = e.stack!.split("\n");
        let line = lines[index]
        if(line) {
            let obc = line.split("(");
            return obc[0].trim()
        }
    }
}

export const Log = new Logger();
