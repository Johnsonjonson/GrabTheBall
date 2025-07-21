import { _decorator, Component, Node, Button, Label } from 'cc';
import { HorizontalSkillManager } from './HorizontalSkillManager';
import { GameConfig, SkillHeight } from './GameConfig';
import { Log } from '../Framework/Log/Logger';

const { ccclass, property } = _decorator;

@ccclass('HorizontalSkillTest')
export class HorizontalSkillTest extends Component {
    @property(Button)
    private generateButton: Button = null;

    @property(Button)
    private testButton: Button = null;

    @property(Button)
    private debugButton: Button = null;

    @property(Label)
    private infoLabel: Label = null;

    start() {
        // 绑定按钮事件
        if (this.generateButton) {
            this.generateButton.node.on(Button.EventType.CLICK, this.onGenerateSkill, this);
        }

        if (this.testButton) {
            this.testButton.node.on(Button.EventType.CLICK, this.onTestSkill, this);
        }

        if (this.debugButton) {
            this.debugButton.node.on(Button.EventType.CLICK, this.onDebugSkill, this);
        }

        this.updateInfo();
    }

    /**
     * 生成技能按钮事件
     */
    private onGenerateSkill(): void {
        this.addLog('=== 开始生成技能 ===');
        
        if (!HorizontalSkillManager.instance) {
            this.addLog('技能管理器未初始化');
            return;
        }

        this.addLog('技能管理器已初始化');
        
        // 检查技能数量
        const currentCount = HorizontalSkillManager.instance.getActiveSkillCount();
        this.addLog(`当前技能数量: ${currentCount}`);

        const success = HorizontalSkillManager.instance.tryGenerateSkill(100); // 100%触发概率用于测试
        if (success) {
            this.addLog('成功生成横版技能');
        } else {
            this.addLog('生成技能失败（可能已达到上限）');
        }

        // 再次检查技能数量
        const newCount = HorizontalSkillManager.instance.getActiveSkillCount();
        this.addLog(`生成后技能数量: ${newCount}`);

        this.updateInfo();
    }

    /**
     * 测试技能功能
     */
    private onTestSkill(): void {
        this.addLog('=== 测试横版技能新功能 ===');
        
        if (!HorizontalSkillManager.instance) {
            this.addLog('错误: 技能管理器未初始化');
            return;
        }

        // 调用调试方法
        HorizontalSkillManager.instance.debugShowSkill();

        // 测试1：检查技能数量
        const skillCount = HorizontalSkillManager.instance.getActiveSkillCount();
        this.addLog(`当前技能数量: ${skillCount}`);

        // 测试2：检查各高度的技能
        for (const height of [SkillHeight.Low, SkillHeight.Mid, SkillHeight.High]) {
            const skill = HorizontalSkillManager.instance.getSkillAtHeight(height);
            if (skill) {
                this.addLog(`高度${height}: ${skill.skillConfig.name} (${skill.triggerCount}/${skill.maxTriggers})`);
                this.addLog(`  移动方向: ${skill.isMovingRight ? '向右' : '向左'}`);
                this.addLog(`  基础速度: ${skill.baseSpeed}`);
            } else {
                this.addLog(`高度${height}: 无技能`);
            }
        }

        // 测试3：保存和加载状态
        this.addLog('保存技能状态...');
        const savedState = HorizontalSkillManager.instance.saveSkillState();
        this.addLog(`保存状态: ${JSON.stringify(savedState)}`);

        this.addLog('=== 测试完成 ===');
        this.updateInfo();
    }

    /**
     * 调试技能按钮事件
     */
    private onDebugSkill(): void {
        this.addLog('=== 调试技能显示 ===');
        
        if (!HorizontalSkillManager.instance) {
            this.addLog('技能管理器未初始化');
            return;
        }

        // 调用调试方法
        HorizontalSkillManager.instance.debugGenerateSkillInCenter();
        this.addLog('已在屏幕中央生成调试技能');
    }

    /**
     * 更新信息显示
     */
    private updateInfo(): void {
        if (!this.infoLabel) return;

        if (!HorizontalSkillManager.instance) {
            this.infoLabel.string = '技能管理器未初始化';
            return;
        }

        const skillCount = HorizontalSkillManager.instance.getActiveSkillCount();
        this.infoLabel.string = `当前技能数量: ${skillCount}/3`;
    }

    /**
     * 添加日志
     */
    private addLog(message: string): void {
        Log.i(`[技能测试] ${message}`);
        console.log(`[技能测试] ${message}`);
    }
} 