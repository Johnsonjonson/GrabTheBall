/**
 * 
 * @FileName: FillMode.ts
 * @ClassName: FillMode
 * @Author: 戴以达
 * @CreateDate: Mon May 19 2025 14:53:29 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/FillMode.ts
 * @Description: 
 * 
 */
/*
 * @Description: 等比自适应放大填充模式
 * @Author: pck
 * @Date: 2021-03-10 15:30:28
 * @Reference: 
 */
import { screen } from 'cc';
import { view } from 'cc';
import { _decorator, Component, Size, UITransform, Enum } from 'cc';
const { ccclass, property, menu } = _decorator;
const FillType = Enum({ MIN: 0, MAX: 1, WIDTH: 2, HEIGHT: 3 });
const FillBy = Enum({ SCALE: 0, SIZE: 1 });
@ccclass('FillMode')
export class FillMode extends Component {
    @property({ type: FillType })
    public fillType = FillType.MAX;

    @property({ type: FillBy })
    public fillBy = FillBy.SCALE;

    onLoad() {
        let visibleSize = view.getVisibleSize(); // 视图分辨率
        let windowSize = screen.windowSize; // 屏幕分辨率

        let visibleRatio = visibleSize.width / visibleSize.height; // 视图分辨率宽高比
        let windowRatio = windowSize.width / windowSize.height;  // 屏幕分辨率宽高比

        let mSize = new Size(visibleSize.width, visibleSize.height);
        if (visibleRatio < windowRatio) { // 屏幕分辨率更细长
            mSize.height = visibleSize.height * visibleRatio / windowRatio;
        } else { // 屏幕实际分辨率更宽
            mSize.width = visibleSize.width * windowRatio / visibleRatio;
        }

        let size: Size = mSize;
        let transform = this.node.getComponent(UITransform);
        if (!transform) return;
        let contentSize = transform?.contentSize;
        if (!contentSize || !contentSize.width || !contentSize.height) return;

        let scaleX = size.width / contentSize.width;
        let scaleY = size.height / contentSize.height;
        let dist;
        switch (this.fillType) {
            case FillType.MAX:
                dist = Math.max(scaleX, scaleY);
                break;
            case FillType.MIN:
                dist = Math.min(scaleX, scaleY);
                break;
            case FillType.WIDTH:
                dist = scaleX;
                break;
            case FillType.HEIGHT:
                dist = scaleY;
                break;
            default:
                dist = Math.max(scaleX, scaleY);
                break;
        }
        this._fill(dist, transform);
    }

    _fill(dist: number, transform: UITransform) {
        if (this.fillBy === FillBy.SCALE) {
            this.node.setScale(dist, dist);
        } else {
            let size = new Size(transform.contentSize.width * dist, transform.contentSize.height * dist)
            transform.setContentSize(size);
        }
    }
}


