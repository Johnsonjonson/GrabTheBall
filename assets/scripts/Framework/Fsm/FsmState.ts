/**
 * 
 * @FileName: FsmState.ts
 * @ClassName: FsmState
 * @Author: yafang
 * @CreateDate: Fri May 31 2024 15:40:12 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Fsm/FsmState.ts
 * @Description: 有限状态机基类
 *      继承自该类，实现自定义状态机。
 * 
 * @param T : 有限状态机持有者类型。
 */

import { Fsm } from './Fsm';

export abstract class FsmState<T> {
    public static stateName: string;

    constructor() {
    
    }

    /**
     * 获取状态机名称
     */
    public abstract getStateName(): string;

    /**
     * 有限状态机状态初始化时调用。
     * @param fsm 有限状态机引用。
     */
    public abstract onInit(fsm: Fsm<T>);

    /**
     * 有限状态机状态进入时调用。
     * @param fsm 有限状态机引用。
     */
    public abstract onEnter(fsm: Fsm<T>);

    /**
     * 有限状态机状态轮询时调用。
     * @param fsm 有限状态机引用。
     * @param deltaTime 每帧时间
     */
    public abstract onUpdate(fsm: Fsm<T>, deltaTime: number);

    /**
     * 有限状态机状态离开时调用。
     * @param fsm 有限状态机引用。
     * @param isShutdown 是否是关闭有限状态机时触发。
     */
    public abstract onLeave(fsm: Fsm<T>, isShutdown: boolean);
    
    /**
     * 有限状态机状态销毁时调用。
     * @param fsm 有限状态机引用。
     */
    public abstract onDestroy(fsm: Fsm<T>);

    /**
     * 切换当前有限状态机状态。
     * @param fsm 有限状态机对象
     * @param stateClass 要切换到的有限状态机状态类型
     */
    public changeState(fsm: Fsm<T>, stateName: string){
        if(!fsm ) {
            throw new Error("FSM is invalid!");
        }

        fsm.changeState(stateName);
    }
}
