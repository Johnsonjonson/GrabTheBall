import { _decorator, Component, Node, Sprite, Label, SpriteFrame, Color, tween, Vec3 } from 'cc';
import { GameConfig, HorizontalSkillType } from './GameConfig';
import { Log } from '../Framework/Log/Logger';

const { ccclass, property } = _decorator;

@ccclass('HorizontalSkillUI')
export class HorizontalSkillUI extends Component {
    @property(Sprite)
    private skillIcon: Sprite = null;

    @property(Label)
    private skillName: Label = null;

    @property(Label)
    private triggerCount: Label = null;

    @property(Node)
    private effectNode: Node = null;

    @property(Sprite)
    private effectSprite: Sprite = null;

    @property(Label)
    private effectLabel: Label = null;

    // 技能配置
    private skillConfig: any = null;
    private currentTriggerCount: number = 0;
    private hasTriggeredThisRound: boolean = false;

    /**
     * 初始化技能UI
     */
    public initSkillUI(config: any): void {
        Log.i(`初始化技能UI: ${config.name}`);

        this.skillConfig = config;
        this.currentTriggerCount = 0;
        
        // 设置技能名称
        if (this.skillName) {
            this.skillName.string = config.name;
        }

        // 设置技能图标（这里需要根据实际资源调整）
        if (this.skillIcon) {
            // this.skillIcon.spriteFrame = this.getSkillIcon(config.id);
        }

        // 更新触发次数显示
        this.updateTriggerCount();

        // 隐藏效果节点
        if (this.effectNode) {
            this.effectNode.active = false;
        }

        Log.i(`初始化技能UI: ${config.name}`);
    }

    /**
     * 更新触发次数
     */
    public updateTriggerCount(): void {
        if (this.triggerCount && this.skillConfig) {
            this.triggerCount.string = `${this.currentTriggerCount}/${this.skillConfig.maxTriggers}`;
        }
    }

    /**
     * 新一轮抓取时重置本轮触发标志
     */
    public resetTriggerForNewRound(): void {
        this.hasTriggeredThisRound = false;
    }

    /**
     * 增加触发次数（同一轮只能触发一次）
     */
    public addTriggerCount(): void {
        if (this.hasTriggeredThisRound) {
            Log.i(`本轮已触发过技能: ${this.skillConfig?.name}`);
            return;
        }
        this.currentTriggerCount++;
        this.hasTriggeredThisRound = true;
        this.updateTriggerCount();
    }

    /**
     * 播放触发效果
     */
    public playTriggerEffect(): void {
        if (!this.effectNode) return;

        this.effectNode.active = true;

        // 根据技能类型播放不同效果
        if (this.skillConfig.type === HorizontalSkillType.Morph) {
            this.playMorphEffect();
        } else if (this.skillConfig.type === HorizontalSkillType.Settlement) {
            this.playSettlementEffect();
        }
    }

    /**
     * 播放形态变更效果
     */
    private playMorphEffect(): void {
        // 闪光特效
        if (this.effectSprite) {
            const originalColor = this.effectSprite.color.clone();
            
            tween(this.effectSprite)
                .to(0.1, { color: new Color(255, 255, 0, 255) }) // 黄色闪光
                .to(0.1, { color: new Color(255, 255, 255, 255) }) // 白色闪光
                .to(0.1, { color: new Color(255, 255, 0, 255) }) // 黄色闪光
                .to(0.1, { color: originalColor })
                .call(() => {
                    this.effectNode.active = false;
                })
                .start();
        }

        // 缩放动画
        tween(this.node)
            .to(0.1, { scale: new Vec3(1.3, 1.3, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();

        Log.i(`播放形态变更效果: ${this.skillConfig.name}`);
    }

    /**
     * 播放结算效果
     */
    private playSettlementEffect(): void {
        // 显示数值
        if (this.effectLabel) {
            const bonusValue = this.skillConfig.bonusValue || 1.0;
            this.effectLabel.string = `x${bonusValue.toFixed(1)}`;
        }

        // 数值增长动画
        if (this.effectLabel) {

            const label = this.effectLabel.node;    
            tween(label)
                .to(0.2, { scale: new Vec3(1.5, 1.5, 1) })
                .to(0.3, { scale: new Vec3(1, 1, 1) })
                .call(() => {
                    this.effectNode.active = false;
                })
                .start();
        }

        // 光效动画
        if (this.effectSprite) {
            const sprite = this.effectSprite;
            tween(sprite)
                .to(0.5, { color: new Color(255, 255, 255, 255) })
                .to(0.5, { color: new Color(255, 255, 255, 0) })
                .start();
        }

        Log.i(`播放结算效果: ${this.skillConfig.name} (倍数: ${this.skillConfig.bonusValue})`);
    }

    /**
     * 播放消失动画
     */
    public playDisappearAnimation(): void {
        tween(this.node)
            .to(0.5, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                this.node.destroy();
            })
            .start();

        Log.i(`播放消失动画: ${this.skillConfig.name}`);
    }

    /**
     * 获取技能图标（需要根据实际资源调整）
     */
    private getSkillIcon(skillId: number): SpriteFrame | null {
        // 这里需要根据实际的图标资源返回对应的SpriteFrame
        // 可以通过资源管理器或直接引用获取
        return null;
    }

    /**
     * 设置技能图标
     */
    public setSkillIcon(spriteFrame: SpriteFrame): void {
        if (this.skillIcon) {
            this.skillIcon.spriteFrame = spriteFrame;
        }
    }

    /**
     * 设置效果图标
     */
    public setEffectIcon(spriteFrame: SpriteFrame): void {
        if (this.effectSprite) {
            this.effectSprite.spriteFrame = spriteFrame;
        }
    }

    /**
     * 获取当前技能配置
     */
    public getSkillConfig(): any {
        return this.skillConfig;
    }

    /**
     * 获取当前触发次数
     */
    public getCurrentTriggerCount(): number {
        return this.currentTriggerCount;
    }

    /**
     * 检查是否达到最大触发次数
     */
    public isMaxTriggered(): boolean {
        return this.currentTriggerCount >= this.skillConfig.maxTriggers;
    }
} 