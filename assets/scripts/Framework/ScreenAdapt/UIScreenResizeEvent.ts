/**
 * 
 * @FileName: UIScreenResizeEvent.ts
 * @ClassName: UIScreenResizeEvent
 * @Author: kuovane
 * @CreateDate: Mon Mar 31 2025 14:54:45 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/GameMain/ScreenAdapt/UIScreenResizeEvent.ts
 * @Description: 
 * 
 */

import { BaseEventArgs } from "../Event/BaseEventArgs";


export class UIScreenResizeEvent extends BaseEventArgs {
    
    getReferenceID(): number {
        return UIScreenResizeEvent.EventID;
    }

    constructor() {
        super();
    }

    public clear() {
        this.isLandscape = false;
    }
    isLandscape: boolean = false;
    public static create(isLandscape: boolean): UIScreenResizeEvent {
        let eventArgs = super.instantiate(UIScreenResizeEvent.EventID, () => new UIScreenResizeEvent());
        eventArgs.isLandscape = isLandscape;
        return eventArgs;
    }
}

