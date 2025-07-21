import { _decorator, Component, Node, Vec3, tween, Tween, Sprite, Color, instantiate, Prefab, UITransform } from 'cc';
import { GameConfig, HorizontalSkillType, SkillHeight } from './GameConfig';
import { Log } from '../Framework/Log/Logger';

const { ccclass, property } = _decorator;

// 横版技能实例接口
interface HorizontalSkillInstance {
    id: number;
    skillConfig: any;
    height: SkillHeight;
    position: Vec3;
    triggerCount: number;
    maxTriggers: number;
    isActive: boolean;
    node: Node;
    tween: Tween<Node>;
}

// 技能触发回调类型
export type SkillTriggerCallback = (skillId: number, skillType: HorizontalSkillType, bonusValue?: number) => void;

@ccclass('HorizontalSkillManager')
export class HorizontalSkillManager extends Component {
    private static _instance: HorizontalSkillManager = null;
    
    @property(Prefab)
    private skillPrefab: Prefab = null;

    @property(Node)
    private skillContainer: Node = null;

    @property(Node)
    private screenBoundary: Node = null;

    // 当前激活的技能
    private activeSkills: Map<SkillHeight, HorizontalSkillInstance> = new Map();
    
    // 技能触发回调
    private skillTriggerCallback: SkillTriggerCallback = null;

    // 屏幕边界
    private screenLeftBound: number = -400;
    private screenRightBound: number = 400;

    public static get instance(): HorizontalSkillManager {
        return HorizontalSkillManager._instance;
    }

    protected onLoad(): void {
        if (HorizontalSkillManager._instance === null) {
            HorizontalSkillManager._instance = this;
        } else {
            this.node.destroy();
            return;
        }
    }

    start() {
        this.initScreenBoundary();
    }

    /**
     * 初始化屏幕边界
     */
    private initScreenBoundary(): void {
        if (this.screenBoundary) {
            const transform = this.screenBoundary.getComponent(UITransform);
            if (transform) {
                this.screenLeftBound = -transform.width / 2;
                this.screenRightBound = transform.width / 2;
            }
        }
    }

    /**
     * 设置技能触发回调
     */
    public setSkillTriggerCallback(callback: SkillTriggerCallback): void {
        this.skillTriggerCallback = callback;
    }

    /**
     * 尝试生成横版技能
     * @param triggerRate 触发概率
     * @returns 是否成功生成技能
     */
    public tryGenerateSkill(triggerRate: number = GameConfig.QuestionBallSkillTriggerRate): boolean {
        // 检查是否达到技能上限
        if (this.activeSkills.size >= 3) {
            Log.w('已达到横版技能上限(3个)');
            return false;
        }

        // 随机触发
        const random = Math.random() * 100;
        if (random > triggerRate) {
            return false;
        }

        // 选择可用的高度
        const availableHeights = this.getAvailableHeights();
        if (availableHeights.length === 0) {
            Log.w('没有可用的高度档位');
            return false;
        }

        // 随机选择高度
        const selectedHeight = availableHeights[Math.floor(Math.random() * availableHeights.length)];
        
        // 选择技能类型
        const availableSkills = this.getAvailableSkillsForHeight(selectedHeight);
        if (availableSkills.length === 0) {
            Log.w(`高度${selectedHeight}没有可用的技能`);
            return false;
        }

        // 根据概率权重选择技能
        const selectedSkill = this.selectSkillByWeight(availableSkills);
        
        // 生成技能
        this.generateSkill(selectedSkill, selectedHeight);
        
        return true;
    }

    /**
     * 获取可用的高度档位
     */
    private getAvailableHeights(): SkillHeight[] {
        const allHeights = [SkillHeight.Low, SkillHeight.Mid, SkillHeight.High];
        return allHeights.filter(height => !this.activeSkills.has(height));
    }

    /**
     * 获取指定高度可用的技能
     */
    private getAvailableSkillsForHeight(height: SkillHeight): any[] {
        return GameConfig.HorizontalSkillConfig.filter(skill => 
            skill.allowedHeights.indexOf(height) !== -1
        );
    }

    /**
     * 根据权重选择技能
     */
    private selectSkillByWeight(skills: any[]): any {
        const totalWeight = skills.reduce((sum, skill) => sum + skill.triggerRate, 0);
        let random = Math.random() * totalWeight;
        
        for (const skill of skills) {
            random -= skill.triggerRate;
            if (random <= 0) {
                return skill;
            }
        }
        
        return skills[0]; // 兜底
    }

    /**
     * 生成技能实例
     */
    private generateSkill(skillConfig: any, height: SkillHeight): void {
        if (!this.skillPrefab || !this.skillContainer) {
            Log.e('技能预制体或容器未设置');
            return;
        }

        // 创建技能节点
        const skillNode = instantiate(this.skillPrefab);
        skillNode.setParent(this.skillContainer);

        // 设置初始位置
        const heightConfig = GameConfig.SkillHeightConfig.find(h => h.height === height);
        const startX = this.screenLeftBound - 100; // 从屏幕左侧外开始
        const y = heightConfig ? heightConfig.yPosition : 0;
        skillNode.setPosition(new Vec3(startX, y, 0));

        // 创建技能实例
        const skillInstance: HorizontalSkillInstance = {
            id: skillConfig.id,
            skillConfig: skillConfig,
            height: height,
            position: skillNode.getPosition(),
            triggerCount: 0,
            maxTriggers: skillConfig.maxTriggers,
            isActive: true,
            node: skillNode,
            tween: null
        };

        // 播放生成动画
        this.playGenerateAnimation(skillInstance);

        // 添加到激活技能列表
        this.activeSkills.set(height, skillInstance);

        Log.i(`生成横版技能: ${skillConfig.name} (高度: ${heightConfig?.name})`);
    }

    /**
     * 播放生成动画
     */
    private playGenerateAnimation(skillInstance: HorizontalSkillInstance): void {
        const node = skillInstance.node;
        const duration = skillInstance.skillConfig.duration;

        // 缩放动画
        node.setScale(0, 0, 1);
        tween(node)
            .to(duration, { scale: new Vec3(1, 1, 1) })
            .call(() => {
                // 开始滑动
                this.startSliding(skillInstance);
            })
            .start();
    }

    /**
     * 开始滑动
     */
    private startSliding(skillInstance: HorizontalSkillInstance): void {
        const node = skillInstance.node;
        const speed = skillInstance.skillConfig.slideSpeed;
        const distance = this.screenRightBound - this.screenLeftBound + 200; // 滑动距离
        const duration = distance / speed;

        // 创建滑动动画
        skillInstance.tween = tween(node)
            .to(duration, { position: new Vec3(this.screenRightBound + 100, node.position.y, 0) })
            .call(() => {
                // 滑动结束，移除技能
                this.removeSkill(skillInstance.height);
            })
            .start();
    }

    /**
     * 检查爪子是否触发技能
     * @param clawPosition 爪子位置
     * @param clawSize 爪子大小
     */
    public checkSkillTrigger(clawPosition: Vec3, clawSize: { width: number, height: number }): void {
        for (const [height, skillInstance] of this.activeSkills) {
            if (!skillInstance.isActive) continue;

            const skillNode = skillInstance.node;
            const skillPos = skillNode.getPosition();
            const skillSize = skillNode.getComponent(UITransform)?.contentSize || { width: 100, height: 50 };

            // 检查碰撞
            if (this.isColliding(clawPosition, clawSize, skillPos, skillSize)) {
                this.triggerSkill(skillInstance);
            }
        }
    }

    /**
     * 检查碰撞
     */
    private isColliding(pos1: Vec3, size1: { width: number, height: number }, 
                       pos2: Vec3, size2: { width: number, height: number }): boolean {
        const left1 = pos1.x - size1.width / 2;
        const right1 = pos1.x + size1.width / 2;
        const top1 = pos1.y + size1.height / 2;
        const bottom1 = pos1.y - size1.height / 2;

        const left2 = pos2.x - size2.width / 2;
        const right2 = pos2.x + size2.width / 2;
        const top2 = pos2.y + size2.height / 2;
        const bottom2 = pos2.y - size2.height / 2;

        return !(left1 > right2 || right1 < left2 || top1 < bottom2 || bottom1 > top2);
    }

    /**
     * 触发技能
     */
    private triggerSkill(skillInstance: HorizontalSkillInstance): void {
        if (skillInstance.triggerCount >= skillInstance.maxTriggers) {
            return;
        }

        skillInstance.triggerCount++;
        
        // 停止滑动
        if (skillInstance.tween) {
            skillInstance.tween.stop();
        }

        // 播放触发效果
        this.playTriggerEffect(skillInstance);

        // 调用回调
        if (this.skillTriggerCallback) {
            const bonusValue = skillInstance.skillConfig.bonusValue;
            this.skillTriggerCallback(skillInstance.id, skillInstance.skillConfig.type, bonusValue);
        }

        Log.i(`触发技能: ${skillInstance.skillConfig.name} (${skillInstance.triggerCount}/${skillInstance.maxTriggers})`);

        // 检查是否达到最大触发次数
        if (skillInstance.triggerCount >= skillInstance.maxTriggers) {
            this.playDisappearAnimation(skillInstance);
        } else {
            // 继续滑动
            this.startSliding(skillInstance);
        }
    }

    /**
     * 播放触发效果
     */
    private playTriggerEffect(skillInstance: HorizontalSkillInstance): void {
        const node = skillInstance.node;
        const duration = skillInstance.skillConfig.effectDuration;

        // 高亮效果
        const sprite = node.getComponent(Sprite);
        if (sprite) {
            const originalColor = sprite.color.clone();
            
            tween(sprite)
                .to(duration / 2, { color: new Color(255, 255, 0, 255) }) // 黄色高亮
                .to(duration / 2, { color: originalColor })
                .start();
        }

        // 缩放效果
        tween(node)
            .to(duration / 2, { scale: new Vec3(1.2, 1.2, 1) })
            .to(duration / 2, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /**
     * 播放消失动画
     */
    private playDisappearAnimation(skillInstance: HorizontalSkillInstance): void {
        const node = skillInstance.node;
        const duration = 0.5;

        tween(node)
            .to(duration, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                this.removeSkill(skillInstance.height);
            })
            .start();
    }

    /**
     * 移除技能
     */
    private removeSkill(height: SkillHeight): void {
        const skillInstance = this.activeSkills.get(height);
        if (skillInstance) {
            if (skillInstance.node) {
                skillInstance.node.destroy();
            }
            this.activeSkills.delete(height);
            Log.i(`移除技能: ${skillInstance.skillConfig.name}`);
        }
    }

    /**
     * 重置所有技能
     */
    public resetAllSkills(): void {
        for (const [height, skillInstance] of this.activeSkills) {
            if (skillInstance.node) {
                skillInstance.node.destroy();
            }
        }
        this.activeSkills.clear();
        Log.i('重置所有横版技能');
    }

    /**
     * 获取当前激活的技能数量
     */
    public getActiveSkillCount(): number {
        return this.activeSkills.size;
    }

    /**
     * 获取指定高度的技能
     */
    public getSkillAtHeight(height: SkillHeight): HorizontalSkillInstance | null {
        return this.activeSkills.get(height) || null;
    }

    /**
     * 保存技能状态（用于离线保存）
     */
    public saveSkillState(): any {
        const state = {
            activeSkills: []
        };

        for (const [height, skillInstance] of this.activeSkills) {
            state.activeSkills.push({
                id: skillInstance.id,
                height: skillInstance.height,
                triggerCount: skillInstance.triggerCount,
                position: {
                    x: skillInstance.position.x,
                    y: skillInstance.position.y,
                    z: skillInstance.position.z
                }
            });
        }

        return state;
    }

    /**
     * 加载技能状态（用于离线恢复）
     */
    public loadSkillState(state: any): void {
        this.resetAllSkills();

        if (state && state.activeSkills) {
            for (const skillData of state.activeSkills) {
                const skillConfig = GameConfig.HorizontalSkillConfig.find(s => s.id === skillData.id);
                if (skillConfig) {
                    // 重新生成技能
                    this.generateSkill(skillConfig, skillData.height);
                    
                    // 恢复触发次数
                    const skillInstance = this.activeSkills.get(skillData.height);
                    if (skillInstance) {
                        skillInstance.triggerCount = skillData.triggerCount;
                        skillInstance.position = new Vec3(skillData.position.x, skillData.position.y, skillData.position.z);
                    }
                }
            }
        }
    }
} 