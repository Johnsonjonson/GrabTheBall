/**
 * 
 * @FileName: FsmManager.ts
 * @ClassName: FsmManager
 * @Author: yafang
 * @CreateDate: Fri May 31 2024 15:40:33 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Fsm/FsmManager.ts
 * @Description: 
 * 
 */

import { Log } from "../Log/Logger";
import { StringUtility } from "../Utility/StringUtility";
import { Fsm } from "./Fsm";
import { FsmState } from "./FsmState";
import { IFsm } from "./IFsm";

export class FsmManager {
    /**
     * 托管的状态机
     */
    private m_fsms: Map<string, IFsm>;
    /**
     * 缓存一份数据，用于处理
     */
    private m_tmpFsms: IFsm[];

    /**
     * 获取有限状态机数量。
     */
    get fsmCount() {
        return this.m_fsms.size;
    }

    constructor() {
        this.m_fsms = new Map();
        this.m_tmpFsms = new Array();
    }

    public onUpdate(deltaTime: number) {
        this.m_tmpFsms.splice(0, this.m_tmpFsms.length);
        if(this.m_fsms.size < 1) {
            return;
        }

        let index = 0;
        this.m_fsms.forEach((fsm, key) => {
            this.m_tmpFsms[index++] = fsm;
        })

        for(let fsm of this.m_tmpFsms) {
            if(!fsm.isDestory && fsm.managerUpdate) {
                fsm.onUpdate(deltaTime);
            }
        }

    }

    /**
     * 销毁所有状态机
     */
    public clear() {
        this.m_fsms.forEach((fsm, key) => {
            fsm.clear();
        })

        this.m_fsms.clear();
        this.m_tmpFsms.splice(0, this.m_tmpFsms.length);

    }

    /**
     * 判断状态机是否存在
     * @param fsmName 状态机名称
     * @returns 
     */
    public hasFsm(fsmName: string): boolean {
        if(StringUtility.isEmpty(fsmName)) {
            Log.e("fsmName is invalid.");
            return false;
        }

        return this.m_fsms.has(fsmName);

    }

    public getFsm<T>(fsmName: string): T {
        if(StringUtility.isEmpty(fsmName)) {
            Log.e("fsmName is invalid.");
            return null;
        }

        if(this.m_fsms.has(fsmName)) {
            return this.m_fsms.get(fsmName) as T;
        }

        return null;
    }

    /**
     * 获取所有状态机
     * @returns 状态机数组
     */
    public getAllFsms(): IFsm[] {
        let fsmArray: IFsm[] = new Array();
        let index = 0;
        this.m_fsms.forEach((fsm, key) => {
            fsmArray[index++] = fsm;
        })

        return fsmArray;
    }

    /**
     * 创建一个有限状态机
     * @param fsmName 
     * @param owner 
     * @param states 
     * @returns 
     */
    public createFsm<T>(fsmName: string, owner: T, states: FsmState<T>[], managedUpdate: boolean = true): Fsm<T> {
        if(StringUtility.isEmpty(fsmName)) {
            throw new Error("fsmName is invalid.");
        }

        if(this.m_fsms.has(fsmName)) {
            throw new Error(`Already exist FSM ${fsmName}.`);
        }
        
        let fsm = new Fsm<T>(fsmName, owner, states);
        this.m_fsms.set(fsmName, fsm);
        
        return fsm;
    }
    
    /**
     * 销毁状态机。
     * @param fsmName 
     * @returns 
     */
    public destroyFsm(fsmName: string): boolean {
        if(StringUtility.isEmpty(fsmName)) {
            Log.e("fsmName is invalid.");
            return false;
        }

        if(this.m_fsms.has(fsmName)) {
            let fsm = this.m_fsms.get(fsmName);
            fsm.clear();

            return this.m_fsms.delete(fsmName);
        }

        return false;
    }
}
