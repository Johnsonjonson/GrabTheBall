/**
 * 
 * @FileName: GameEventArgs.ts
 * @ClassName: GameEventArgs
 * @Author: yafang
 * @CreateDate: Fri May 17 2024 19:27:32 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Event/GameEventArgs.ts
 * @Description: 
 *      游戏内通用事件，公共模块事件可以使用这个。
 */

import { BaseEventArgs } from "./BaseEventArgs";

export class GameEventArgs extends BaseEventArgs {
    getReferenceID(): number {
        return GameEventArgs.EventID;
    }
    /**
     * 事件类型
     */
    public readonly TYPE = {
        RegisterComponent: 1,   // 组件注册事件
        RoleBorn: 2,
        SplashHidden: 3, // 进度条界面隐藏
        Transition: 4, // 场景切换动画
    };

    /**
     * 传递的数据
     */
    public userData: any = null;

    public mtype: number = -1;

    public static create(): GameEventArgs {
        let eventArgs = super.instantiate(GameEventArgs.EventID, () => new GameEventArgs());
        return eventArgs;
    }

    public clear() {
        this.userData = null;
        this.mtype = -1;
    }
}
