import { _decorator, Component, Node, Button, Label, Vec3 } from 'cc';
import { HorizontalSkillManager } from './HorizontalSkillManager';
import { GameConfig, HorizontalSkillType, SkillHeight } from './GameConfig';
import { Log } from '../Framework/Log/Logger';

const { ccclass, property } = _decorator;

@ccclass('HorizontalSkillExample')
export class HorizontalSkillExample extends Component {
    @property(Button)
    private generateSkillButton: Button = null;

    @property(Button)
    private resetSkillsButton: Button = null;

    @property(Button)
    private testTriggerButton: Button = null;

    @property(Label)
    private skillCountLabel: Label = null;

    @property(Label)
    private logLabel: Label = null;

    @property(Node)
    private skillManagerNode: Node = null;

    private skillManager: HorizontalSkillManager = null;
    private logMessages: string[] = [];

    protected onLoad(): void {
        // 设置技能触发回调
        if (HorizontalSkillManager.instance) {
            HorizontalSkillManager.instance.setSkillTriggerCallback(this.onSkillTriggered.bind(this));
        }
    }

    start() {
        this.setupButtons();
        this.updateUI();
    }

    /**
     * 设置按钮事件
     */
    private setupButtons(): void {
        if (this.generateSkillButton) {
            this.generateSkillButton.node.on(Button.EventType.CLICK, this.onGenerateSkill, this);
        }

        if (this.resetSkillsButton) {
            this.resetSkillsButton.node.on(Button.EventType.CLICK, this.onResetSkills, this);
        }

        if (this.testTriggerButton) {
            this.testTriggerButton.node.on(Button.EventType.CLICK, this.onTestTrigger, this);
        }
    }

    /**
     * 更新UI显示
     */
    private updateUI(): void {
        if (this.skillCountLabel && HorizontalSkillManager.instance) {
            const count = HorizontalSkillManager.instance.getActiveSkillCount();
            this.skillCountLabel.string = `当前技能数量: ${count}/3`;
        }
    }

    /**
     * 生成技能按钮事件
     */
    private onGenerateSkill(): void {
        if (!HorizontalSkillManager.instance) {
            this.addLog('技能管理器未初始化');
            return;
        }

        const success = HorizontalSkillManager.instance.tryGenerateSkill(100); // 100%触发概率用于测试
        if (success) {
            this.addLog('成功生成横版技能');
        } else {
            this.addLog('生成技能失败（可能已达到上限）');
        }

        this.updateUI();
    }

    /**
     * 重置技能按钮事件
     */
    private onResetSkills(): void {
        if (!HorizontalSkillManager.instance) {
            this.addLog('技能管理器未初始化');
            return;
        }

        HorizontalSkillManager.instance.resetAllSkills();
        this.addLog('已重置所有技能');
        this.updateUI();
    }

    /**
     * 测试触发按钮事件
     */
    private onTestTrigger(): void {
        if (!HorizontalSkillManager.instance) {
            this.addLog('技能管理器未初始化');
            return;
        }

        // 模拟爪子位置和大小
        const clawPosition = new Vec3(0, 0, 0);
        const clawSize = { width: 100, height: 50 };

        // 检查技能触发
        HorizontalSkillManager.instance.checkSkillTrigger(clawPosition, clawSize);
        this.addLog('测试技能触发检测');
    }

    /**
     * 技能触发回调
     */
    private onSkillTriggered: (skillId: number, skillType: HorizontalSkillType, bonusValue?: number) => void = 
        (skillId: number, skillType: HorizontalSkillType, bonusValue?: number) => {
            const skillConfig = GameConfig.HorizontalSkillConfig.find(s => s.id === skillId);
            const skillName = skillConfig ? skillConfig.name : `未知技能(${skillId})`;
            
            let message = `触发技能: ${skillName}`;
            if (skillType === HorizontalSkillType.Settlement && bonusValue) {
                message += ` (倍数: x${bonusValue})`;
            }
            
            this.addLog(message);
            this.updateUI();
        };

    /**
     * 添加日志消息
     */
    private addLog(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        this.logMessages.push(logMessage);
        
        // 保持最多10条日志
        if (this.logMessages.length > 10) {
            this.logMessages.shift();
        }
        
        // 更新日志显示
        if (this.logLabel) {
            this.logLabel.string = this.logMessages.join('\n');
        }
        
        Log.i(message);
    }

    /**
     * 测试横版技能系统功能
     */
    public testHorizontalSkillSystem(): void {
        this.addLog('=== 开始测试横版技能系统 ===');
        
        if (!HorizontalSkillManager.instance) {
            this.addLog('错误: 技能管理器未初始化');
            return;
        }

        // 测试1：生成技能
        this.addLog('测试1: 生成技能');
        for (let i = 0; i < 5; i++) {
            const success = HorizontalSkillManager.instance.tryGenerateSkill(100);
            this.addLog(`生成技能 ${i + 1}: ${success ? '成功' : '失败'}`);
        }

        // 测试2：检查技能数量
        const skillCount = HorizontalSkillManager.instance.getActiveSkillCount();
        this.addLog(`测试2: 当前技能数量 = ${skillCount}`);

        // 测试3：检查各高度的技能
        this.addLog('测试3: 检查各高度技能');
        for (const height of [SkillHeight.Low, SkillHeight.Mid, SkillHeight.High]) {
            const skill = HorizontalSkillManager.instance.getSkillAtHeight(height);
            if (skill) {
                this.addLog(`高度${height}: ${skill.skillConfig.name}`);
            } else {
                this.addLog(`高度${height}: 无技能`);
            }
        }

        // 测试4：保存和加载状态
        this.addLog('测试4: 保存技能状态');
        const savedState = HorizontalSkillManager.instance.saveSkillState();
        this.addLog(`保存状态: ${JSON.stringify(savedState)}`);

        // 测试5：重置后重新加载
        this.addLog('测试5: 重置并重新加载');
        HorizontalSkillManager.instance.resetAllSkills();
        HorizontalSkillManager.instance.loadSkillState(savedState);
        this.addLog('状态重新加载完成');

        this.addLog('=== 横版技能系统测试完成 ===');
        this.updateUI();
    }

    /**
     * 测试技能配置
     */
    public testSkillConfig(): void {
        this.addLog('=== 开始测试技能配置 ===');
        
        // 显示所有技能配置
        for (const skill of GameConfig.HorizontalSkillConfig) {
            this.addLog(`技能: ${skill.name}`);
            this.addLog(`  - ID: ${skill.id}`);
            this.addLog(`  - 类型: ${skill.type === HorizontalSkillType.Morph ? '形态变更' : '结算'}`);
            this.addLog(`  - 触发概率: ${skill.triggerRate}%`);
            this.addLog(`  - 允许高度: ${skill.allowedHeights.join(', ')}`);
            this.addLog(`  - 滑动速度: ${skill.slideSpeed}`);
            this.addLog(`  - 最大触发: ${skill.maxTriggers}`);
            if (skill.bonusValue) {
                this.addLog(`  - 加成倍数: x${skill.bonusValue}`);
            }
        }

        // 显示高度配置
        this.addLog('高度配置:');
        for (const heightConfig of GameConfig.SkillHeightConfig) {
            this.addLog(`  - ${heightConfig.name}: Y=${heightConfig.yPosition}`);
        }

        this.addLog('=== 技能配置测试完成 ===');
    }

    /**
     * 组件销毁时清理事件监听
     */
    onDestroy() {
        if (this.generateSkillButton) {
            this.generateSkillButton.node.off(Button.EventType.CLICK, this.onGenerateSkill, this);
        }
        if (this.resetSkillsButton) {
            this.resetSkillsButton.node.off(Button.EventType.CLICK, this.onResetSkills, this);
        }
        if (this.testTriggerButton) {
            this.testTriggerButton.node.off(Button.EventType.CLICK, this.onTestTrigger, this);
        }
    }
} 