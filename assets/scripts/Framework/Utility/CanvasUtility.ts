/**
 * 
 * @FileName: CanvasUtility.ts
 * @ClassName: CanvasUtility
 * @Author: yafang
 * @CreateDate: Tue Jul 02 2024 11:58:52 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/CanvasUtility.ts
 * @Description:  UI 画布管理组件
 *      主要用于管理画布的适配问题。
 */

import { screen } from 'cc';
import { UITransform } from 'cc';
import { Size } from 'cc';
import { view } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Log } from '../Log/Logger';
import { Canvas } from 'cc';
import { NodeEventType } from 'cc';
import { EventDispatcher } from '../Event/EventDispatcher';
import { UIScreenResizeEvent } from '../ScreenAdapt/UIScreenResizeEvent';

const { ccclass, property } = _decorator;

@ccclass('CanvasUtility')
export class CanvasUtility extends Component {

    protected __preload(): void {
        this.fitScreen(); 
    }

    onLoad() {
        EventDispatcher.subscribe(UIScreenResizeEvent.EventID, this.fitScreen, this)
    }
    

    start() {

    }

    update(deltaTime: number) {

    }

    onDestroy() {
        EventDispatcher.unsubscribe(UIScreenResizeEvent.EventID, this.fitScreen, this)
    }
    /**
     * 铺满全屏，通过拉伸的方式铺满全屏。
     */
    private fitScreen() {
        Log.d("CanvasUtility fitScreen")

        let visibleSize = view.getVisibleSize(); // 视图分辨率
        let windowSize = screen.windowSize; // 屏幕分辨率

        let visibleRatio = visibleSize.width / visibleSize.height; // 视图分辨率宽高比
        let windowRatio = windowSize.width / windowSize.height;  // 屏幕分辨率宽高比

        let mSize = new Size(visibleSize.width, visibleSize.height);
        if(visibleRatio < windowRatio) { // 屏幕分辨率更细长
            mSize.height = visibleSize.height * visibleRatio / windowRatio;
        } else { // 屏幕实际分辨率更宽
            mSize.width = visibleSize.width * windowRatio / visibleRatio;
        }

        this.node.getComponent(UITransform).setContentSize(mSize);
    

        if (this.getComponent(Canvas)?.alignCanvasWithScreen) {
            this.node.emit(NodeEventType.TRANSFORM_CHANGED);
        }
    }

    refresh() {
        this.fitScreen()
    }
}
