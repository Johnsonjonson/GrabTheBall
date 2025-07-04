/**
 * 
 * @FileName: ScreenResizeComponent.ts
 * @ClassName: ScreenResizeComponent
 * @Author: kuovane
 * @CreateDate: Mon Mar 31 2025 14:54:45 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/GameMain/ScreenAdapt/ScreenResizeComponent.ts
 * @Description: 
 * 
 */

import { _decorator, Component, screen, view, ResolutionPolicy } from 'cc';
import { UIScreenResizeEvent } from './UIScreenResizeEvent';
import { EventDispatcher } from '../Event/EventDispatcher';
import { sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScreenResizeComponent')
export class ScreenResizeComponent extends Component {

    onLoad() {
        screen.on("window-resize", this.onScreenResize, this)
        screen.on('orientation-change', this.onScreenResize, this);
    }

    start() {
        this.onScreenResize()
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        screen.off("window-resize", this.onScreenResize, this)
        screen.off("orientation-change", this.onScreenResize, this)
    }

    private isLandscape(): boolean {
        return screen.windowSize.height < screen.windowSize.width
    }

    private onScreenResize() {

        this.scheduleOnce(function () {
            this.delayDealScreenResize()
        }, 0.0)
    }

    private delayDealScreenResize() {
        // 是否是横屏
        if (this.isLandscape()) {
            view.setDesignResolutionSize(1280, 720, ResolutionPolicy.FIXED_HEIGHT)
        } else {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_WIDTH)
        }

        // 给需要适配屏幕的 UI 发事件
        EventDispatcher.dispatch(UIScreenResizeEvent.EventID, UIScreenResizeEvent.create(this.isLandscape()))
    }
}
