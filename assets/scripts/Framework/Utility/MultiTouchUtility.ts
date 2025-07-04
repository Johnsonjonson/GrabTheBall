/**
 * 
 * @FileName: MultiTouchUtility.ts
 * @ClassName: MultiTouchUtility
 * @Author: yafang
 * @CreateDate: Sat Mar 22 2025 17:51:10 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/MultiTouchUtility.ts
 * @Description: 控制场景多点触控开关
 * 
 */

import { CCBoolean } from 'cc';
import { Enum } from 'cc';
import { CCInteger } from 'cc';
import { macro } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

enum MultiTouchEnable {
   NONE,   // 不操作
   ENABLE, // 开启
   DISABLE  // 关闭
}
Enum(MultiTouchEnable);

@ccclass('MultiTouchUtility')
export class MultiTouchUtility extends Component {
    @property({type: MultiTouchEnable, tooltip: "进入时是否开启多点触控"})
    private enterEnable: MultiTouchEnable = MultiTouchEnable.NONE;

    @property({
        type: MultiTouchEnable,
        tooltip: "离开时是否开启多点触控",
    })
    private exitEnable: MultiTouchEnable = MultiTouchEnable.NONE;

    onLoad() {
    
    }
    
    protected onEnable(): void {
        this.setMultiTouchEnable(this.enterEnable);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    protected onDisable(): void {
        this.setMultiTouchEnable(this.exitEnable);
    }

    private setMultiTouchEnable(enable: MultiTouchEnable) {
        if(enable == MultiTouchEnable.ENABLE) {
            macro.ENABLE_MULTI_TOUCH  = true;
        } else if(enable == MultiTouchEnable.DISABLE) {
            macro.ENABLE_MULTI_TOUCH  = false;
        }
    }

    onDestroy() {
        
    }
}
