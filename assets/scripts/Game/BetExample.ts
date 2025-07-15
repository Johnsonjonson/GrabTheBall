import { _decorator, Component, Node, Button, Label } from 'cc';
import { Log } from '../Framework/Log/Logger';
import { BetManager } from './BetManager';
import { EnergyManager } from './EnergyManager';
import { LevelManager } from './LevelManager';

const { ccclass, property } = _decorator;

@ccclass('BetExample')
export class BetExample extends Component {
    @property(Button)
    private switchBetButton: Button = null;

    @property(Button)
    private addEnergyButton: Button = null;

    @property(Button)
    private addLevelButton: Button = null;

    @property(Button)
    private testRewardButton: Button = null;

    @property(Button)
    private resetButton: Button = null;

    @property(Label)
    private infoLabel: Label = null;

    start() {
        this.setupButtonEvents();
        this.updateInfo();
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents(): void {
        if (this.switchBetButton) {
            this.switchBetButton.node.on(Button.EventType.CLICK, this.onSwitchBetClick, this);
        }

        if (this.addEnergyButton) {
            this.addEnergyButton.node.on(Button.EventType.CLICK, this.onAddEnergyClick, this);
        }

        if (this.addLevelButton) {
            this.addLevelButton.node.on(Button.EventType.CLICK, this.onAddLevelClick, this);
        }

        if (this.testRewardButton) {
            this.testRewardButton.node.on(Button.EventType.CLICK, this.onTestRewardClick, this);
        }

        if (this.resetButton) {
            this.resetButton.node.on(Button.EventType.CLICK, this.onResetClick, this);
        }
    }

    /**
     * 切换BET按钮点击
     */
    private onSwitchBetClick(): void {
        BetManager.instance.switchToNextBet();
        this.updateInfo();
        Log.i('切换BET');
    }

    /**
     * 添加体力按钮点击
     */
    private onAddEnergyClick(): void {
        EnergyManager.instance.addEnergy(50);
        this.updateInfo();
        Log.i('添加50点体力');
    }

    /**
     * 添加等级按钮点击
     */
    private onAddLevelClick(): void {
        LevelManager.instance.addExp(1000);
        this.updateInfo();
        Log.i('添加1000经验值');
    }

    /**
     * 测试奖励按钮点击
     */
    private onTestRewardClick(): void {
        this.testRewardCalculation();
    }

    /**
     * 重置按钮点击
     */
    private onResetClick(): void {
        BetManager.instance.resetBetState();
        EnergyManager.instance.resetEnergyState();
        LevelManager.instance.resetPlayerLevel();
        this.updateInfo();
        Log.i('重置所有状态');
    }

    /**
     * 测试奖励计算
     */
    private testRewardCalculation(): void {
        const currentBet = BetManager.instance.getCurrentBet();
        
        // 测试不同基础奖励的BET计算
        const testRewards = [1, 2, 5, 10, 20];
        
        Log.i('=== BET奖励计算测试 ===');
        Log.i(`当前BET: ${currentBet}x`);
        
        for (const baseReward of testRewards) {
            const normalReward = BetManager.instance.calculateReward(baseReward, false);
            const specialReward = BetManager.instance.calculateReward(baseReward, true);
            
            Log.i(`基础奖励: ${baseReward} -> 普通物品: ${normalReward}, 特殊物品: ${specialReward}`);
        }
        
        Log.i('=== 测试完成 ===');
    }

    /**
     * 更新信息显示
     */
    private updateInfo(): void {
        if (!this.infoLabel) {
            return;
        }

        const currentBet = BetManager.instance.getCurrentBet();
        const betConfig = BetManager.instance.getCurrentBetConfig();
        const availableBets = BetManager.instance.getAvailableBets();
        const hasEnoughEnergy = BetManager.instance.hasEnoughEnergy();
        
        const energyState = EnergyManager.instance.getEnergyState();
        const levelInfo = LevelManager.instance.getPlayerLevelInfo();

        let info = `=== BET系统信息 ===\n`;
        info += `当前BET: ${currentBet}x\n`;
        
        if (betConfig) {
            info += `体力消耗: ${betConfig.energyCost}\n`;
            info += `解锁等级: ${betConfig.unlockLevel}\n`;
        }
        
        info += `可用BET: ${availableBets.join(', ')}\n`;
        info += `体力充足: ${hasEnoughEnergy ? '是' : '否'}\n`;
        info += `\n=== 状态信息 ===\n`;
        info += `体力: ${energyState.currentEnergy}/${energyState.maxEnergy}\n`;
        info += `等级: ${levelInfo.level}\n`;
        info += `经验: ${levelInfo.exp}/${levelInfo.nextLevelExp}\n`;
        info += `进度: ${levelInfo.expProgress.toFixed(1)}%`;

        this.infoLabel.string = info;
    }

    /**
     * 测试BET系统
     */
    public testBetSystem(): void {
        Log.i('=== 开始测试BET系统 ===');
        
        // 测试1: 检查初始状态
        const initialBet = BetManager.instance.getCurrentBet();
        Log.i(`初始BET: ${initialBet}`);
        
        // 测试2: 切换BET
        BetManager.instance.switchToNextBet();
        const newBet = BetManager.instance.getCurrentBet();
        Log.i(`切换后BET: ${newBet}`);
        
        // 测试3: 检查体力消耗
        const hasEnergy = BetManager.instance.hasEnoughEnergy();
        Log.i(`体力充足: ${hasEnergy}`);
        
        // 测试4: 测试奖励计算
        this.testRewardCalculation();
        
        Log.i('=== BET系统测试完成 ===');
    }

    /**
     * 测试等级体力联动
     */
    public testLevelEnergyIntegration(): void {
        Log.i('=== 开始测试等级体力联动 ===');
        
        const initialLevel = LevelManager.instance.getCurrentLevel();
        const initialEnergy = EnergyManager.instance.getEnergyState().currentEnergy;
        
        Log.i(`初始等级: ${initialLevel}, 初始体力: ${initialEnergy}`);
        
        // 添加经验值升级
        LevelManager.instance.addExp(2000);
        
        const newLevel = LevelManager.instance.getCurrentLevel();
        const newEnergy = EnergyManager.instance.getEnergyState().currentEnergy;
        
        Log.i(`升级后等级: ${newLevel}, 升级后体力: ${newEnergy}`);
        
        // 检查BET可用性变化
        const availableBets = BetManager.instance.getAvailableBets();
        Log.i(`升级后可用BET: ${availableBets.join(', ')}`);
        
        Log.i('=== 等级体力联动测试完成 ===');
    }
} 