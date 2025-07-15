import { _decorator, Component, Node, Label, Button, Sprite, Color } from 'cc';
import { Log } from '../Framework/Log/Logger';
import { BetManager } from './BetManager';
import { EnergyManager } from './EnergyManager';
import { LevelManager } from './LevelManager';

const { ccclass, property } = _decorator;

@ccclass('BetUI')
export class BetUI extends Component {
    @property(Label)
    private betLabel: Label = null;

    @property(Button)
    private betButton: Button = null;

    @property(Label)
    private energyCostLabel: Label = null;

    @property(Label)
    private unlockLevelLabel: Label = null;

    @property(Sprite)
    private betButtonSprite: Sprite = null;

    // 颜色配置
    private readonly NORMAL_COLOR = new Color(255, 255, 255, 255);
    private readonly DISABLED_COLOR = new Color(128, 128, 128, 255);
    private readonly UNAVAILABLE_COLOR = new Color(64, 64, 64, 255);

    protected onLoad(): void {
        // 设置BET变化回调
        BetManager.instance.setBetChangeCallback(this.onBetChanged.bind(this));
        
        // 设置体力变化回调
        // EnergyManager.instance.setEnergyChangeCallback(this.onEnergyChanged.bind(this));
        
        // 设置等级变化回调
        LevelManager.instance.setLevelChangeCallback(this.onLevelChanged.bind(this));
    }

    start() {
        this.updateUI();
        this.setupButtonEvents();
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents(): void {
        if (this.betButton) {
            this.betButton.node.on(Button.EventType.CLICK, this.onBetButtonClick, this);
        }
    }

    /**
     * BET按钮点击事件
     */
    private onBetButtonClick(): void {
        BetManager.instance.switchToNextBet();
    }

    /**
     * BET变化回调
     */
    private onBetChanged(newBet: number): void {
        this.updateUI();
    }

    /**
     * 体力变化回调
     */
    private onEnergyChanged(): void {
        this.updateUI();
    }

    /**
     * 等级变化回调
     */
    private onLevelChanged(newLevel: number): void {
        this.updateUI();
    }

    /**
     * 更新UI显示
     */
    private updateUI(): void {
        const currentBet = BetManager.instance.getCurrentBet();
        const betConfig = BetManager.instance.getCurrentBetConfig();
        const availableBets = BetManager.instance.getAvailableBets();
        const hasEnoughEnergy = BetManager.instance.hasEnoughEnergy();
        const currentLevel = LevelManager.instance.getPlayerLevelInfo().level;

        // 更新BET显示
        if (this.betLabel) {
            this.betLabel.string = currentBet + 'x';
        }

        // 更新体力消耗显示
        if (this.energyCostLabel && betConfig) {
            this.energyCostLabel.string = '消耗: ' + betConfig.energyCost + ' 体力';
        }

        // 更新解锁等级显示
        if (this.unlockLevelLabel && betConfig) {
            if (betConfig.unlockLevel <= currentLevel) {
                this.unlockLevelLabel.string = '已解锁';
                this.unlockLevelLabel.color = new Color(0, 255, 0, 255);
            } else {
                this.unlockLevelLabel.string = '需要等级: ' + betConfig.unlockLevel;
                this.unlockLevelLabel.color = new Color(255, 255, 0, 255);
            }
        }

        // 更新按钮状态
        this.updateButtonState(availableBets, hasEnoughEnergy, betConfig);

        Log.i('更新BET UI - 当前BET: ' + currentBet + ', 可用BET: ' + availableBets.join(', ') + ', 体力充足: ' + hasEnoughEnergy);
    }

    /**
     * 更新按钮状态
     */
    private updateButtonState(availableBets: number[], hasEnoughEnergy: boolean, betConfig: any): void {
        if (!this.betButton || !this.betButtonSprite) {
            return;
        }

        const currentBet = BetManager.instance.getCurrentBet();
        const isAvailable = availableBets.indexOf(currentBet) !== -1;

        if (!isAvailable) {
            // BET不可用（等级不够）
            this.betButton.interactable = false;
            this.betButtonSprite.color = this.UNAVAILABLE_COLOR;
        } else if (!hasEnoughEnergy) {
            // 体力不足
            this.betButton.interactable = false;
            this.betButtonSprite.color = this.DISABLED_COLOR;
        } else {
            // 正常状态
            this.betButton.interactable = true;
            this.betButtonSprite.color = this.NORMAL_COLOR;
        }
    }

    /**
     * 显示BET信息提示
     */
    public showBetInfo(): void {
        const currentBet = BetManager.instance.getCurrentBet();
        const betConfig = BetManager.instance.getCurrentBetConfig();
        const availableBets = BetManager.instance.getAvailableBets();
        const hasEnoughEnergy = BetManager.instance.hasEnoughEnergy();

        let info = `当前BET: ${currentBet}x\n`;
        
        if (betConfig) {
            info += `体力消耗: ${betConfig.energyCost}\n`;
            info += `解锁等级: ${betConfig.unlockLevel}\n`;
            info += `描述: ${betConfig.description}\n`;
        }

        info += `\n可用BET: ${availableBets.join(', ')}\n`;
        info += `体力充足: ${hasEnoughEnergy ? '是' : '否'}`;

        Log.i('BET信息:\n' + info);
    }

    /**
     * 强制更新UI
     */
    public forceUpdateUI(): void {
        this.updateUI();
    }
} 