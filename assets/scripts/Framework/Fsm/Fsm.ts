/**
 * 
 * @FileName: Fsm.ts
 * @ClassName: Fsm
 * @Author: yafang
 * @CreateDate: Fri May 31 2024 15:40:41 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Fsm/Fsm.ts
 * @Description: 有限状态机
 * 
 */

import { Log } from "../Log/Logger";
import { StringUtility } from "../Utility/StringUtility";
import { FsmState } from "./FsmState";
import { IFsm } from "./IFsm";

export class Fsm<T> extends IFsm {

    /**
     * 有限状态机持有者
     */
    get owner() {
        return this.m_owner;
    }
    protected m_owner: T;

    /**
     * 获取当前运行的
     */
    get currentState() {
        return this.m_currentState;
    }
    protected m_currentState: FsmState<T>;

    // 状态集，使用状态机类名作为Key保存。
    private m_states: Map<string,FsmState<T>>;
    /**
     * 获取有限状态机中状态的数量。
     */
    get fsmStateCount() {
        return this.m_states.size;
    }

    /**
     * 有限状态机是否运行。
     */
    get isRuning() {
        if(this.m_currentState == null || this.m_currentState == undefined) {
            return false;
        }
        return true ;
    }

    // 保存数据
    private m_datas: Map<string, any>; 

    /**
     * 
     * @param name 状态机名称
     * @param owner 状态机拥有者
     * @param states 所有状态对象
     */
    constructor(name: string, owner: T, states: FsmState<T>[], managedUpdate: boolean = true) {
        super();
    
        if(!owner) {
            throw new Error("FSM owner is invalid.")
        }

        if(!states || states.length < 1) {
            throw new Error("FSM states is invalid.")
        }

        this.m_states = new Map();
        this.m_datas = new Map();

        this.m_managerUpdate = managedUpdate;
        this.m_name = name;
        this.m_owner = owner;
        this.m_isDestoryed = false;
        this.m_currentState = null;

        for(let state of states) {
            if(!state) {
                throw new Error("FSM states value is invalid.");
            }

            let stateName = state.getStateName();
            if(this.m_states.has(stateName)) {
                throw new Error(`FSM ${name} state ${stateName} is already exist.`);
            }

            this.m_states.set(stateName, state);
            state.onInit(this);
        }

    }

    public start(stateName: string) {
        if(this.isRuning) {
            throw new Error("FSM is running, can not start again.");
        }

        if(!this.m_states.has(stateName)) {
            throw new Error(`FSM can not start state ${stateName} which is not int states Map.`);
        }

        this.m_currentStateTime = 0;
        this.m_currentState = this.m_states.get(stateName);
        this.m_currentState.onEnter(this);
        
    }

    public isInState(stateName: string): boolean {
        return this.m_currentState == this.m_states.get(stateName)
    }

    public hasState(stateName: string): boolean {
        return this.m_states.has(stateName);
    }
    public getState<TState extends FsmState<T>>(stateName: string): TState {
        if(this.m_states.has(stateName)) {
            let state = this.m_states.get(stateName) as TState;
            return state;
        }

        return null;
    }
    public getAllStates<TState extends FsmState<T>>(): TState[] {
        let states: TState[] = new Array();
        let index = 0;
        this.m_states.forEach((state, key) => {
            states[index++] = state as TState;
        });

        return states;
    }

    public changeState(stateName: string) {
        if(!this.m_states.has(stateName)) {
            throw new Error(`FSM ${this.m_name} can not change state to ${stateName} which is not exist.`);
        }

        if(!this.m_currentState) {
            throw new Error("Current state is invalid.");
        }

        Log.d(`FSM ${this.m_currentState.getStateName()} to ${stateName}`)
        let nextState = this.m_states.get(stateName);
        this.m_currentState.onLeave(this, false);
        this.m_currentStateTime = 0;
        this.m_currentState = nextState;
        this.m_currentState.onEnter(this);
    }

    public hasData(name: string): boolean {
        if(StringUtility.isEmpty(name)) {
            return false;
        }

        return this.m_datas.has(name);
    }
    public getData<Tdata>(name: string): Tdata {
        if(StringUtility.isEmpty(name)) {
            Log.e("Data name is invalid.")

            return null;
        }

        if(this.m_datas.has(name)) {
            return this.m_datas.get(name) as Tdata;
        }

        return null;
    }
    public setData<Tdata>(name: string, data: Tdata) {
        if(StringUtility.isEmpty(name)) {
            throw new Error("Data name is invalid.");
        }

        if(data == null) {
            throw new Error("Data is invalid.");
        }

        this.m_datas.set(name, data);
    }
    public removeData(name: string) {
        if(StringUtility.isEmpty(name)) {
            Log.e("Data name is invalid.");
            return;
        }

        if(this.m_datas.has(name)) {
            this.m_datas.delete(name);
        }
    }
    
    public onUpdate(deltaTime: number) {
        if(!this.m_currentState) {
            return;
        }

        this.m_currentStateTime += deltaTime;
        this.m_currentState.onUpdate(this, deltaTime); 
    }
    public clear() {
        if(this.m_currentState) {
            this.m_currentState.onLeave(this, true);
        }

        this.m_states.forEach( (state, key) => {
            state.onDestroy(this);
        })

        this.m_name = null;
        this.m_owner = null;
        this.m_states.clear();
        this.m_datas.clear();
        this.m_currentState = null;
        this.m_currentStateTime = 0;
        this.m_isDestoryed = true;
    }
}
