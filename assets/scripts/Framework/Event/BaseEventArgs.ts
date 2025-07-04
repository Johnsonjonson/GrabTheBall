/**
 * 
 * @FileName: BaseEventArgs.ts
 * @ClassName: BaseEventArgs
 * @Author: yafang
 * @CreateDate: Fri May 17 2024 16:22:16 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Event/BaseEventArgs.ts
 * @Description: 
 *  
 */

import { Reference } from "../ReferencePool/Reference";
import { ReferencePool } from "../ReferencePool/ReferencePool";
import { MathUtility } from "../Utility/MathUtility";

export abstract class BaseEventArgs extends Reference {

    // 复用引用ID，保持事件ID唯一即可
    static get EventID(): number {
        return this.ReferenceID;
    }
    getReferenceID(): number {
        return BaseEventArgs.EventID;
    }

    constructor() {
        super();
    }

    /**
 * 根据类型获取唯一事件ID
 */
    public static getEventIDByType(type: number): string {
        return `${this.EventID}_${type}`
    }

    protected static instantiate<T extends BaseEventArgs>(eventId: number, ctor: () => T): T {
        return ReferencePool.acquire<T>(eventId, ctor);
    }

    public abstract clear();

}
