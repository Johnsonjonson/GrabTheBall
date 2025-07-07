import { _decorator, Component, EventTouch, instantiate, Node, Prefab, RigidBody2D, RigidBodyComponent, size, Size, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3, Button, Director } from 'cc';
import { Ball } from './Ball';
import { BallType, BallColor, GameConfig } from './GameConfig';
import { BallManager } from './BallManager';
import { Claws } from './Claws';
import { EnergyManager } from './EnergyManager';
import { LevelManager } from './LevelManager';
import { Log } from '../Framework/Log/Logger';
const { ccclass, property } = _decorator;

@ccclass('MainGame')
export class MainGame extends Component {
    @property(Node)
    private ballTouchArea: Node = null;
    
    @property(Node)
    private ballContainer: Node = null;

    // 爪子组件
    @property(Claws)
    private claws: Claws = null;

    @property(Prefab)
    private ballPrefab: Prefab = null;

    // 长按相关属性
    @property(Button)
    private crabButton: Button = null;

    private autoCrab: boolean = false;

    // 长按检测相关变量
    private longPressTimer: number = 0;
    private longPressDuration: number = 1.0; // 长按触发时间（秒）
    private isLongPressing: boolean = false;
    private longPressTriggered: boolean = false;
    private clawsComponent: Claws = null;

    protected onLoad(): void {
        
    }
    
    start() {
        this.ballTouchArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.ballTouchArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.ballTouchArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        // 初始化长按功能
        this.initLongPress();

        // 设置爪子抓取结束回调
        this.clawsComponent = this.claws.getComponent(Claws);
        this.clawsComponent.setCrabBallEndCallback(this.onCrabBallEnd.bind(this));

        // 爪子与球体contaier的距离
        var ballContainerPos = this.ballContainer.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
        var ballContainerSize = this.ballContainer.getComponent(UITransform).contentSize;
        var clawPos = this.claws.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
        var clawsSize = this.claws.getComponent(UITransform).contentSize;
        var clawLength = ballContainerPos.y - clawPos.y - ballContainerSize.height / 2; //- clawsSize.height / 2;
        // clawLength += 100;
        this.clawsComponent.setClawLength(clawLength);

        BallManager.instance.setBallContainer(this.ballContainer);
        BallManager.instance.setBallPrefab(this.ballPrefab);
        BallManager.instance.initBalls();

        this.initEnergy();
        this.iniUserInfo();
    }

    private initEnergy() {
        // EnergyManager.instance.initEnergy();
        var energyState = EnergyManager.instance.getEnergyState();
        Log.i('体力状态: ' + energyState.currentEnergy + ' / ' + energyState.maxEnergy);
    }

    private iniUserInfo() {
        var levelInfo = LevelManager.instance.getPlayerLevelInfo();
        var energyInfo = EnergyManager.instance.getEnergyState();
        Log.i('体力信息: ' + energyInfo.currentEnergy + ' / ' + energyInfo.maxEnergy);
        Log.i('等级信息: ' + levelInfo.level + ' / ' + levelInfo.exp + ' / ' + levelInfo.totalExp + ' / ' + levelInfo.nextLevelExp + ' / ' + levelInfo.expProgress);
    }

    /**
     * 初始化长按功能
     */
    private initLongPress() {
        if (this.crabButton) {
            // 监听按钮的触摸开始事件
            this.crabButton.node.on(Node.EventType.TOUCH_START, this.onButtonTouchStart, this);
            // 监听按钮的触摸结束事件
            this.crabButton.node.on(Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
            // 监听按钮的触摸取消事件
            this.crabButton.node.on(Node.EventType.TOUCH_CANCEL, this.onButtonTouchEnd, this);
        }
    }

    /**
     * 按钮触摸开始事件
     */
    private onButtonTouchStart(event: EventTouch) {
        this.isLongPressing = true;
        this.longPressTriggered = false;
        this.longPressTimer = 0;
        console.log('Button touch start - long press timer started');
    }

    /**
     * 按钮触摸结束事件
     */
    private onButtonTouchEnd(event: EventTouch) {
        this.isLongPressing = false;
        this.longPressTimer = 0;
        
        // 如果没有触发长按，则执行普通点击
        if (!this.longPressTriggered) {
            this.onBtnCrabClick();
        }
        
        console.log('Button touch end');
    }

    onTouchStart(event: EventTouch) {
        console.log('touch start');
        if (this.clawsComponent.isUpdatingHeight()) {
            return;
        }
        var location = event.getUILocation();
        this.updateAngle(location);
    }

    onTouchMove(event: EventTouch) {
        if (this.clawsComponent.isUpdatingHeight()) {
            return;
        }
        console.log('touch move');
        var location = event.getUILocation();
        this.updateAngle(location);
    }

    onTouchEnd(event: EventTouch) {
        if (this.clawsComponent.isUpdatingHeight()) {
            return;
        }
        var location = event.getUILocation();
        this.updateAngle(location);
        this.clawsComponent.setUpdatingHeight(true);
        // 只用角度和长度计算末端点
        this.crabTheBalls();
    }    

    updateAngle(location: Vec2) {
        var size = this.ballTouchArea.getComponent(UITransform).contentSize;
        this.clawsComponent.updateAngle(location, size);
    }

    crabTheBalls() {
        var amount = 1;
        var energyInfo = EnergyManager.instance.getEnergyState();
        if (energyInfo.currentEnergy < amount) {
            Log.i('体力不足，无法抓取');
            return;
        }
        EnergyManager.instance.subEnergy(amount);
        this.clawsComponent.crabTheBalls(this.ballContainer);
    }

    onCrabBallEnd(balls: Node[]) {
        this.clawsComponent.setUpdatingHeight(false);
        
        // 添加新球
        BallManager.instance.addBall();
        
        if (this.autoCrab) {
            this.crabTheBalls();
        }
    }

    onBtnCrabClick() {
        if (this.autoCrab) {
            this.autoCrab = false;
        } else {
            this.crabTheBalls();
        }
    }

    onBtnCrabLongPress() {
        //  长按自动抓取
        this.autoCrab = true;
        this.crabTheBalls();
    }

    update(deltaTime: number) {
        // 长按检测逻辑
        if (this.isLongPressing && !this.longPressTriggered) {
            this.longPressTimer += deltaTime;
            if (this.longPressTimer >= this.longPressDuration) {
                this.longPressTriggered = true;
                this.onBtnCrabLongPress();
                console.log('Long press triggered!');
            }
        }
    }

    /**
     * 组件销毁时清理事件监听
     */
    onDestroy() {
        if (this.crabButton) {
            this.crabButton.node.off(Node.EventType.TOUCH_START, this.onButtonTouchStart, this);
            this.crabButton.node.off(Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
            this.crabButton.node.off(Node.EventType.TOUCH_CANCEL, this.onButtonTouchEnd, this);
        }
    }
}


