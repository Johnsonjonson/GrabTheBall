import { _decorator, Component, Node, Button, Label, director } from 'cc';
import { Log } from '../Framework/Log/Logger';
import { BetManager } from './BetManager';
import { EnergyManager } from './EnergyManager';
import { LevelManager } from './LevelManager';

const { ccclass, property } = _decorator;

@ccclass('BetTestScene')
export class BetTestScene extends Component {
    @property(Label)
    private statusLabel: Label = null;

    @property(Button)
    private testBetButton: Button = null;

    @property(Button)
    private testEnergyButton: Button = null;

    @property(Button)
    private testLevelButton: Button = null;

    @property(Button)
    private backToGameButton: Button = null;

    start() {
        this.setupButtons();
        this.updateStatus();
    }

    private setupButtons(): void {
        if (this.testBetButton) {
            this.testBetButton.node.on(Button.EventType.CLICK, this.testBetSystem, this);
        }

        if (this.testEnergyButton) {
            this.testEnergyButton.node.on(Button.EventType.CLICK, this.testEnergySystem, this);
        }

        if (this.testLevelButton) {
            this.testLevelButton.node.on(Button.EventType.CLICK, this.testLevelSystem, this);
        }

        if (this.backToGameButton) {
            this.backToGameButton.node.on(Button.EventType.CLICK, this.backToGame, this);
        }
    }

    private testBetSystem(): void {
        Log.i('=== 测试BET系统 ===');
        
        // 测试BET切换
        const currentBet = BetManager.instance.getCurrentBet();
        Log.i(`当前BET: ${currentBet}x`);
        
        BetManager.instance.switchToNextBet();
        const newBet = BetManager.instance.getCurrentBet();
        Log.i(`切换后BET: ${newBet}x`);
        
        // 测试奖励计算
        const baseReward = 5;
        const normalReward = BetManager.instance.calculateReward(baseReward, false);
        const specialReward = BetManager.instance.calculateReward(baseReward, true);
        
        Log.i(`基础奖励: ${baseReward} -> 普通: ${normalReward}, 特殊: ${specialReward}`);
        
        this.updateStatus();
    }

    private testEnergySystem(): void {
        Log.i('=== 测试体力系统 ===');
        
        const energyState = EnergyManager.instance.getEnergyState();
        Log.i(`当前体力: ${energyState.currentEnergy}/${energyState.maxEnergy}`);
        
        // 添加体力
        EnergyManager.instance.addEnergy(30);
        
        const newEnergyState = EnergyManager.instance.getEnergyState();
        Log.i(`添加体力后: ${newEnergyState.currentEnergy}/${newEnergyState.maxEnergy}`);
        
        this.updateStatus();
    }

    private testLevelSystem(): void {
        Log.i('=== 测试等级系统 ===');
        
        const levelInfo = LevelManager.instance.getPlayerLevelInfo();
        Log.i(`当前等级: ${levelInfo.level}, 经验: ${levelInfo.exp}`);
        
        // 添加经验值
        LevelManager.instance.addExp(1500);
        
        const newLevelInfo = LevelManager.instance.getPlayerLevelInfo();
        Log.i(`添加经验后: ${newLevelInfo.level}, 经验: ${newLevelInfo.exp}`);
        
        this.updateStatus();
    }

    private backToGame(): void {
        // 返回主游戏场景
        director.loadScene('mainGame');
    }

    private updateStatus(): void {
        if (!this.statusLabel) {
            return;
        }

        const currentBet = BetManager.instance.getCurrentBet();
        const betConfig = BetManager.instance.getCurrentBetConfig();
        const availableBets = BetManager.instance.getAvailableBets();
        const hasEnoughEnergy = BetManager.instance.hasEnoughEnergy();
        
        const energyState = EnergyManager.instance.getEnergyState();
        const levelInfo = LevelManager.instance.getPlayerLevelInfo();

        let status = `=== BET测试场景 ===\n`;
        status += `当前BET: ${currentBet}x\n`;
        
        if (betConfig) {
            status += `体力消耗: ${betConfig.energyCost}\n`;
            status += `解锁等级: ${betConfig.unlockLevel}\n`;
        }
        
        status += `可用BET: ${availableBets.join(', ')}\n`;
        status += `体力充足: ${hasEnoughEnergy ? '是' : '否'}\n`;
        status += `\n=== 状态信息 ===\n`;
        status += `体力: ${energyState.currentEnergy}/${energyState.maxEnergy}\n`;
        status += `等级: ${levelInfo.level}\n`;
        status += `经验: ${levelInfo.exp}/${levelInfo.nextLevelExp}\n`;
        status += `进度: ${levelInfo.expProgress.toFixed(1)}%`;

        this.statusLabel.string = status;
    }
} 