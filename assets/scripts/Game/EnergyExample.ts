import { _decorator, Component, Node, Button, Label } from 'cc';
import { EnergyManager } from './EnergyManager';
import { LevelManager } from './LevelManager';
import { Log } from '../Framework/Log/Logger';

const { ccclass, property } = _decorator;

@ccclass('EnergyExample')
export class EnergyExample extends Component {
    @property(Label)
    private energyLabel: Label = null;

    @property(Label)
    private levelLabel: Label = null;

    @property(Label)
    private expLabel: Label = null;

    @property(Button)
    private consumeButton: Button = null;

    @property(Button)
    private adButton: Button = null;

    @property(Button)
    private purchaseButton: Button = null;

    @property(Button)
    private addExpButton: Button = null;

    @property(Button)
    private levelUpButton: Button = null;

    @property(Button)
    private resetButton: Button = null;

    protected onLoad(): void {
        // 设置体力变化回调
        EnergyManager.instance.setEnergyChangeCallback(this.onEnergyChanged.bind(this));
        
        // 设置体力不足回调
        EnergyManager.instance.setEnergyInsufficientCallback(this.onEnergyInsufficient.bind(this));
        
        // 设置等级变化回调
        LevelManager.instance.setLevelChangeCallback(this.onLevelChanged.bind(this));
    }

    start() {
        this.updateUI();
        this.setupButtons();
    }

    /**
     * 设置按钮事件
     */
    private setupButtons(): void {
        if (this.consumeButton) {
            this.consumeButton.node.on(Button.EventType.CLICK, this.onConsumeEnergy, this);
        }

        if (this.adButton) {
            this.adButton.node.on(Button.EventType.CLICK, this.onWatchAd, this);
        }

        if (this.purchaseButton) {
            this.purchaseButton.node.on(Button.EventType.CLICK, this.onPurchaseEnergy, this);
        }

        if (this.addExpButton) {
            this.addExpButton.node.on(Button.EventType.CLICK, this.onAddExp, this);
        }

        if (this.levelUpButton) {
            this.levelUpButton.node.on(Button.EventType.CLICK, this.onLevelUp, this);
        }

        if (this.resetButton) {
            this.resetButton.node.on(Button.EventType.CLICK, this.onReset, this);
        }
    }

    /**
     * 更新UI显示
     */
    private updateUI(): void {
        // 更新体力显示
        if (this.energyLabel) {
            const energyInfo = EnergyManager.instance.getEnergyInfo();
            this.energyLabel.string = `体力: ${energyInfo.displayText}`;
        }

        // 更新等级显示
        if (this.levelLabel) {
            const levelInfo = LevelManager.instance.getPlayerLevelInfo();
            this.levelLabel.string = `等级: ${levelInfo.level}`;
        }

        // 更新经验值显示
        if (this.expLabel) {
            const levelInfo = LevelManager.instance.getPlayerLevelInfo();
            this.expLabel.string = `经验: ${levelInfo.exp}/${levelInfo.nextLevelExp} (${levelInfo.expProgress.toFixed(1)}%)`;
        }
    }

    /**
     * 体力变化回调
     */
    private onEnergyChanged(currentEnergy: number, maxEnergy: number): void {
        Log.i(`体力变化: ${currentEnergy}/${maxEnergy}`);
        this.updateUI();
    }

    /**
     * 体力不足回调
     */
    private onEnergyInsufficient(remainingTime: string, recoveryAmount: number): void {
        Log.w(`体力不足！还需等待 ${remainingTime} 恢复 ${recoveryAmount} 点体力`);
        
        // 这里可以显示体力不足的UI提示
        // 例如：显示购买体力窗口或等待恢复提示
    }

    /**
     * 等级变化回调
     */
    private onLevelChanged(oldLevel: number, newLevel: number, exp: number): void {
        Log.i(`等级提升: ${oldLevel} -> ${newLevel}`);
        
        // 通知体力管理器等级变化
        EnergyManager.instance.onLevelChanged();
        
        this.updateUI();
    }

    /**
     * 消耗体力按钮事件
     */
    private onConsumeEnergy(): void {
        const success = EnergyManager.instance.consumeEnergy(10);
        if (success) {
            Log.i('成功消耗10点体力');
        } else {
            Log.w('体力不足，无法消耗');
        }
    }

    /**
     * 观看广告按钮事件
     */
    private onWatchAd(): void {
        Log.i('开始观看广告...');
        EnergyManager.instance.gainEnergyByAd().then((success) => {
            if (success) {
                Log.i('广告观看完成，获得体力');
            } else {
                Log.e('广告观看失败');
            }
        });
    }

    /**
     * 购买体力按钮事件
     */
    private onPurchaseEnergy(): void {
        Log.i('开始购买体力...');
        EnergyManager.instance.gainEnergyByPurchase(2).then((success) => {
            if (success) {
                Log.i('购买完成，获得体力');
            } else {
                Log.e('购买失败');
            }
        });
    }

    /**
     * 添加经验值按钮事件
     */
    private onAddExp(): void {
        LevelManager.instance.addExp(1000);
        Log.i('添加1000经验值');
    }

    /**
     * 升级按钮事件
     */
    private onLevelUp(): void {
        const currentLevel = LevelManager.instance.getCurrentLevel();
        const nextLevel = currentLevel + 1;
        LevelManager.instance.setPlayerLevel(nextLevel);
        Log.i(`手动升级到 ${nextLevel} 级`);
    }

    /**
     * 重置按钮事件
     */
    private onReset(): void {
        EnergyManager.instance.resetEnergyState();
        LevelManager.instance.resetPlayerLevel();
        Log.i('已重置体力状态和等级');
        this.updateUI();
    }

    /**
     * 测试体力系统功能
     */
    public testEnergySystem(): void {
        Log.i('=== 开始测试体力系统 ===');
        
        // 测试1：检查初始状态
        const energyInfo = EnergyManager.instance.getEnergyInfo();
        Log.i(`初始体力: ${energyInfo.displayText}`);
        
        // 测试2：消耗体力
        const consumeSuccess = EnergyManager.instance.consumeEnergy(20);
        Log.i(`消耗20体力: ${consumeSuccess ? '成功' : '失败'}`);
        
        // 测试3：通过广告获得体力
        EnergyManager.instance.gainEnergyByAd().then((success) => {
            Log.i(`广告获得体力: ${success ? '成功' : '失败'}`);
        });
        
        // 测试4：检查体力不足情况
        EnergyManager.instance.consumeEnergy(1000);
        
        Log.i('=== 体力系统测试完成 ===');
    }

    /**
     * 测试等级系统功能
     */
    public testLevelSystem(): void {
        Log.i('=== 开始测试等级系统 ===');
        
        // 测试1：检查初始等级
        const levelInfo = LevelManager.instance.getPlayerLevelInfo();
        Log.i(`初始等级: ${levelInfo.level}, 经验: ${levelInfo.exp}`);
        
        // 测试2：添加经验值
        LevelManager.instance.addExp(5000);
        Log.i('添加5000经验值');
        
        // 测试3：检查升级后的体力上限
        const energyLimit = LevelManager.instance.getCurrentEnergyLimit();
        const recoveryPerHour = LevelManager.instance.getCurrentRecoveryPerHour();
        Log.i(`当前体力上限: ${energyLimit}, 每小时恢复: ${recoveryPerHour}`);
        
        // 测试4：手动设置等级
        LevelManager.instance.setPlayerLevel(5);
        Log.i('手动设置等级为5级');
        
        Log.i('=== 等级系统测试完成 ===');
    }

    /**
     * 测试等级与体力的联动
     */
    public testLevelEnergyIntegration(): void {
        Log.i('=== 开始测试等级体力联动 ===');
        
        // 测试1：记录当前状态
        const initialLevel = LevelManager.instance.getCurrentLevel();
        const initialEnergy = EnergyManager.instance.getEnergyInfo();
        Log.i(`初始状态 - 等级: ${initialLevel}, 体力: ${initialEnergy.displayText}`);
        
        // 测试2：升级并检查体力上限变化
        LevelManager.instance.setPlayerLevel(initialLevel + 2);
        const newEnergyLimit = LevelManager.instance.getCurrentEnergyLimit();
        Log.i(`升级后体力上限: ${newEnergyLimit}`);
        
        // 测试3：检查体力恢复速度变化
        const newRecoveryRate = LevelManager.instance.getCurrentRecoveryPerHour();
        Log.i(`升级后恢复速度: ${newRecoveryRate}/小时`);
        
        // 测试4：体力超出上限的情况
        EnergyManager.instance.addEnergy(50);
        const finalEnergy = EnergyManager.instance.getEnergyInfo();
        Log.i(`最终体力状态: ${finalEnergy.displayText}`);
        
        Log.i('=== 等级体力联动测试完成 ===');
    }

    /**
     * 组件销毁时清理事件监听
     */
    onDestroy() {
        if (this.consumeButton) {
            this.consumeButton.node.off(Button.EventType.CLICK, this.onConsumeEnergy, this);
        }
        if (this.adButton) {
            this.adButton.node.off(Button.EventType.CLICK, this.onWatchAd, this);
        }
        if (this.purchaseButton) {
            this.purchaseButton.node.off(Button.EventType.CLICK, this.onPurchaseEnergy, this);
        }
        if (this.addExpButton) {
            this.addExpButton.node.off(Button.EventType.CLICK, this.onAddExp, this);
        }
        if (this.levelUpButton) {
            this.levelUpButton.node.off(Button.EventType.CLICK, this.onLevelUp, this);
        }
        if (this.resetButton) {
            this.resetButton.node.off(Button.EventType.CLICK, this.onReset, this);
        }
    }
} 