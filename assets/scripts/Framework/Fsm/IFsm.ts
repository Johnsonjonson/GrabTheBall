/**
 * 
 * @FileName: IFsm.ts
 * @ClassName: IFsm
 * @Author: yafang
 * @CreateDate: Fri May 31 2024 17:47:45 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Fsm/IFsm.ts
 * @Description: 有限状态机接口。
 * 
 */

import { FsmState } from "./FsmState";

export abstract class IFsm {

    /**
     * 获取有限状态机名称。
     */
    get fsmName() {
        return this.m_name;
    }
    protected m_name: string;

    /**
     * 是否托管给框架层调用onUpdate方法
     */
    protected m_managerUpdate: boolean = true;
    get managerUpdate() {
        return this.m_managerUpdate;
    }

    /**
     * 当前状态机是否销毁。
     */
    get isDestory() {
        return this.m_isDestoryed;
    }
    protected m_isDestoryed: boolean;

    /**
     * 获取当前状态机持续时间。
     */
    get currentStateTime() {
        return this.m_currentStateTime;
    }
    protected m_currentStateTime: number;

    constructor() {
        this.m_currentStateTime = 0;
        this.m_isDestoryed = true;
    }

    /**
     * 开始有限状态机。
     * @param stateName  状态机类名
     */
    public abstract start(stateName: string);

    /**
     * 是否存在有限状态机状态。
     * @param stateName  状态机类名
     */
    public abstract hasState(stateName: string): boolean;

    /**
     * 获取有限状态机状态。
     * @param stateName  状态机类名
     */
    public abstract getState(stateName: string);

    /**
     * 获取有限状态机的所有状态。
     * return 有限状态机的所有状态。
     */
    public abstract getAllStates();

    /**
     * 切换当前有限状态机状态。
     * @param stateName  状态机类名
     */
    public abstract changeState(stateName: string);

    /**
     * 每帧调用
     * @param deltaTime 每帧持续时间
     */
    public abstract onUpdate(deltaTime: number);


    /**
     * 是否存在有限状态机数据。
     * @param name 有限状态机数据名称。
     */
    public abstract hasData(name: string): boolean;

    /**
     * 获取有限状态机数据。
     * @param name 有限状态机数据名称。
     */
    public abstract getData<Tdata>(name: string): Tdata;

    /**
     * 设置有限状态机数据。
     * @param data 数据
     * @param name 数据名称
     */
    public abstract setData<Tdata>(name: string, data: Tdata);

    /**
     * 移除数据
     * @param name 数据名称
     */
    public abstract removeData(name: string);

    /**
     * 关闭并清理状态机
     */
    public abstract clear();

}
