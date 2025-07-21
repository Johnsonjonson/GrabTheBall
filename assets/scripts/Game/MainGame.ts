import { _decorator, Component, EventTouch, instantiate, Node, Prefab, RigidBody2D, RigidBodyComponent, size, Size, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3, Button, Director, ProgressBar, Label } from 'cc';
import { Ball } from './Ball';
import { BallType, BallColor, GameConfig, HorizontalSkillType } from './GameConfig';
import { BallManager } from './BallManager';
import { Claws } from './Claws';
import { EnergyManager } from './EnergyManager';
import { LevelManager } from './LevelManager';
import { BetManager } from './BetManager';
import { HorizontalSkillManager, SkillTriggerCallback } from './HorizontalSkillManager';
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

    // 横版技能相关
    @property(Node)
    private skillManagerNode: Node = null;

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

        // 初始化横版技能系统
        this.initHorizontalSkillSystem();

        console.log('尝试生成技能，HorizontalSkillManager.instance:', HorizontalSkillManager.instance);
        const success = HorizontalSkillManager.instance.tryGenerateSkill(100);
        console.log('技能生成结果:', success);

        // this.initEnergy();
        this.iniUserInfo();
    }

    private initEnergy() {
        // EnergyManager.instance.setEnergyChangeCallback(this.updateEnergy.bind(this));
        // EnergyManager.instance.initEnergy();
        // var energyState = EnergyManager.instance.getEnergyState();
        // Log.i('体力状态: ' + energyState.currentEnergy + ' / ' + energyState.maxEnergy);
        // this.energyBar.progress = energyState.currentEnergy / energyState.maxEnergy;
        // this.energyLabel.string = energyState.currentEnergy + ' / ' + energyState.maxEnergy;

        // EnergyManager.instance.addEnergy(10);
        // this.updateEnergy();
    }

    // private updateEnergy() {
    //     var energyState = EnergyManager.instance.getEnergyState();
    //     Log.i('体力状态: ' + energyState.currentEnergy + ' / ' + energyState.maxEnergy);
    //     this.energyBar.progress = energyState.currentEnergy / energyState.maxEnergy;
    //     this.energyLabel.string = energyState.currentEnergy + ' / ' + energyState.maxEnergy;
    // }

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
        // 使用BET系统消耗体力
        var result = BetManager.instance.consumeEnergy();
        if (!result) {
            Log.i('体力不足，无法抓取');
            this.clawsComponent.setUpdatingHeight(false);
            return;
        }
        this.clawsComponent.crabTheBalls(this.ballContainer);
    }

    onCrabBallEnd(balls: Node[]) {
        this.clawsComponent.setUpdatingHeight(false);
        
        // 检查是否有问号球，尝试生成横版技能
        this.checkQuestionBallForSkill(balls);
        
        // 计算奖励（根据BET倍数）
        this.calculateRewards(balls);
        
        // 添加新球
        BallManager.instance.addBall();
        
        if (this.autoCrab) {
            this.crabTheBalls();
        }

        // 一轮抓取结束后，重置所有技能的触发标志，并隐藏已达上限的技能
        HorizontalSkillManager.instance.resetAndCheckSkillsForNewRound();
    }

    /**
     * 计算奖励
     */
    private calculateRewards(balls: Node[]): void {
        if (!balls || balls.length === 0) {
            return;
        }

        let totalReward = 0;
        let specialItems = 0;

        for (const ball of balls) {
            const ballComponent = ball.getComponent(Ball);
            if (ballComponent) {
                const ballType = ballComponent.getBallType();
                const baseReward = this.getBaseReward(ballType);
                
                // 检查是否为特殊物品（大球和巨大球）
                const isSpecialItem = ballType === BallType.Big || ballType === BallType.SuperBig;
                
                if (isSpecialItem) {
                    specialItems++;
                    // 特殊物品不参与倍数增加
                    totalReward += baseReward;
                } else {
                    // 普通物品按BET倍数计算
                    const reward = BetManager.instance.calculateReward(baseReward, false);
                    totalReward += reward;
                }
            }
        }

        Log.i(`抓取完成 - 球数量: ${balls.length}, 特殊物品: ${specialItems}, 总奖励: ${totalReward}`);
    }

    /**
     * 获取基础奖励
     */
    private getBaseReward(ballType: BallType): number {
        switch (ballType) {
            case BallType.SuperMini:
                return 1;
            case BallType.Mini:
                return 2;
            case BallType.Mid:
                return 5;
            case BallType.Big:
                return 10;
            case BallType.SuperBig:
                return 20;
            default:
                return 1;
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

    resetEnergy() {
        EnergyManager.instance.resetEnergyState();
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

    /**
     * 初始化横版技能系统
     */
    private initHorizontalSkillSystem(): void {
        if (!this.skillManagerNode) {
            Log.w('技能管理器节点未设置');
            return;
        }

        const skillManager = this.skillManagerNode.getComponent(HorizontalSkillManager);
        if (!skillManager) {
            Log.e('未找到HorizontalSkillManager组件');
            return;
        }

        // 设置技能触发回调
        skillManager.setSkillTriggerCallback(this.onSkillTriggered.bind(this));

        Log.i('横版技能系统初始化完成');
        console.log('横版技能系统初始化完成，skillManagerNode:', this.skillManagerNode.name);
    }

    /**
     * 检查问号球并尝试生成技能
     */
    private checkQuestionBallForSkill(balls: Node[]): void {
        if (!HorizontalSkillManager.instance) return;

        // 检查是否有问号球（这里需要根据实际的问号球类型来判断）
        let hasQuestionBall = false;
        for (const ball of balls) {
            const ballComponent = ball.getComponent(Ball);
            if (ballComponent) {
                // 这里需要根据实际的问号球标识来判断
                // 例如：if (ballComponent.getBallType() === BallType.Question) {
                //     hasQuestionBall = true;
                //     break;
                // }
            }
        }

        // 如果有问号球，尝试生成横版技能
        if (hasQuestionBall) {
            const success = HorizontalSkillManager.instance.tryGenerateSkill();
            if (success) {
                Log.i('成功生成横版技能');
            }
        }
    }

    /**
     * 技能触发回调
     */
    private onSkillTriggered: SkillTriggerCallback = (skillId: number, skillType: HorizontalSkillType, bonusValue?: number) => {
        Log.i(`技能触发: ID=${skillId}, 类型=${skillType}, 倍数=${bonusValue || 1}`);

        if (skillType === HorizontalSkillType.Morph) {
            this.handleMorphSkill(skillId);
        } else if (skillType === HorizontalSkillType.Settlement) {
            this.handleSettlementSkill(skillId, bonusValue || 1.0);
        }
    };

    /**
     * 处理形态变更技能
     */
    private handleMorphSkill(skillId: number): void {
        switch (skillId) {
            case 1: // 双倍爪子
                this.applyDoubleClawEffect();
                break;
            case 2: // 磁力爪子
                this.applyMagneticClawEffect();
                break;
            case 5: // 超级爪子
                this.applySuperClawEffect();
                break;
            default:
                Log.w(`未知的形态变更技能: ${skillId}`);
        }
    }

    /**
     * 处理结算技能
     */
    private handleSettlementSkill(skillId: number, bonusValue: number): void {
        switch (skillId) {
            case 3: // 金币加成
                this.applyCoinBonus(bonusValue);
                break;
            case 4: // 经验加成
                this.applyExpBonus(bonusValue);
                break;
            default:
                Log.w(`未知的结算技能: ${skillId}`);
        }
    }

    /**
     * 应用双倍爪子效果
     */
    private applyDoubleClawEffect(): void {
        // 这里实现双倍爪子的逻辑
        Log.i('应用双倍爪子效果');
        // 可以修改爪子的碰撞检测范围或视觉效果
    }

    /**
     * 应用磁力爪子效果
     */
    private applyMagneticClawEffect(): void {
        // 这里实现磁力爪子的逻辑
        Log.i('应用磁力爪子效果');
        // 可以修改球的吸引逻辑
    }

    /**
     * 应用超级爪子效果
     */
    private applySuperClawEffect(): void {
        // 这里实现超级爪子的逻辑
        Log.i('应用超级爪子效果');
        // 可以修改爪子的抓取能力
    }

    /**
     * 应用金币加成
     */
    private applyCoinBonus(bonusValue: number): void {
        // 这里实现金币加成的逻辑
        Log.i(`应用金币加成: x${bonusValue}`);
        // 可以在计算奖励时应用倍数
    }

    /**
     * 应用经验加成
     */
    private applyExpBonus(bonusValue: number): void {
        // 这里实现经验加成的逻辑
        Log.i(`应用经验加成: x${bonusValue}`);
        // 可以在计算经验时应用倍数
    }
}


