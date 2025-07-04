/**
 * 
 * @FileName: EventDispatcher.ts
 * @ClassName: EventDispatcher
 * @Author: yafang
 * @CreateDate: Fri May 17 2024 18:25:58 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Event/EventDispatcher.ts
 * @Description: 
 * 
 */

import { EventTarget } from "cc";
import { BaseEventArgs } from "./BaseEventArgs";
import { ReferencePool } from "../ReferencePool/ReferencePool";

const eventTarget = new EventTarget;

export class EventDispatcher {

    /**
     * 注册事件监听
     * @param eventID 事件ID
     * @param callBack 回调函数
     * @param target 事件回调函数目标（this）
     * @param once 为true则监听一次后移除
     */
    public static subscribe<TFunction extends (...any: any[]) => void>(eventID: number | string, callBack: TFunction, target?: any, once?: boolean ) {
        eventTarget.on(eventID, callBack, target, once);
    }

    /**
     *  取消事件监听（参数需要和注册一致）
     * @param eventID 事件ID
     * @param callBack  回调函数
     * @param target 
     */
    public static unsubscribe<TFunction extends (...any: any[]) => void>(eventID: number | string, callBack: TFunction, target?: any) {
        eventTarget.off(eventID, callBack, target);
    }

    /**
     * 分发事件
     * @param eventID 事件ID
     * @param eventArg 事件类，继承自BaseEventArgs
     */
    public static dispatch<TEventArg extends BaseEventArgs>(eventID: number | string, eventArg: TEventArg) {
         
        eventTarget.emit(eventID, eventArg);

        // 分发完成后释放事件类
        ReferencePool.release(eventArg);
    }

    /**
     * 移除某组事件。
     * @param target 
     */
    public static unsubscriByTarget(target: any) {
        eventTarget.targetOff(target);
    }

    public static targetOff(target: any) {
        eventTarget.targetOff(target)
    }
}
