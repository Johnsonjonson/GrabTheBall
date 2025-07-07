import { _decorator, Component, Node, Label, ProgressBar, Sprite, Color, tween, Vec3 } from 'cc';
import { EnergyManager, EnergyInsufficientCallback } from './EnergyManager';
const { ccclass, property } = _decorator;

@ccclass('EnergyUI')
export class EnergyUI extends Component {
    @property(Label)
    private energyLabel: Label = null;

    @property(ProgressBar)
    private energyProgressBar: ProgressBar = null;

    @property(Node)
    private energyTipNode: Node = null;

    @property(Label)
    private energyTipLabel: Label = null;

    @property(Node)
    private purchasePanel: Node = null;

    @property(Label)
    private purchaseTitleLabel: Label = null;

    @property(Node)
    private adButton: Node = null;

    @property(Node)
    private purchaseButtons: Node[] = [];

    private energyManager: EnergyManager = null;

    protected onLoad(): void {
        this.energyManager = EnergyManager.instance;
        if (this.energyManager) {
            this.energyManager.setEnergyChangeCallback(this.onEnergyChange.bind(this));
            this.energyManager.setEnergyInsufficientCallback(this.onEnergyInsufficient.bind(this));
        }
    }

    start() {
        this.updateEnergyDisplay();
        this.hideEnergyTip();
        this.hidePurchasePanel();
    }

    /**
     * 体力变化回调
     */
    private onEnergyChange(currentEnergy: number, maxEnergy: number): void {
        this.updateEnergyDisplay();
    }

    /**
     * 体力不足回调
     */
    private onEnergyInsufficient: EnergyInsufficientCallback = (remainingTime: string, recoveryAmount: number) => {
        this.showEnergyTip(`还剩${remainingTime}恢复${recoveryAmount}体力`);
        this.showPurchasePanel();
    };

    /**
     * 更新体力显示
     */
    private updateEnergyDisplay(): void {
        if (!this.energyManager) return;

        const energyInfo = this.energyManager.getEnergyInfo();
        
        // 更新文本显示
        if (this.energyLabel) {
            this.energyLabel.string = energyInfo.displayText;
        }

        // 更新进度条
        if (this.energyProgressBar) {
            this.energyProgressBar.progress = energyInfo.percentage / 100;
            
            // 根据体力状态设置进度条颜色
            const progressBarSprite = this.energyProgressBar.getComponent(Sprite);
            if (progressBarSprite) {
                if (energyInfo.current > energyInfo.max) {
                    // 超出上限时显示金色
                    progressBarSprite.color = new Color(255, 215, 0, 255);
                } else if (energyInfo.percentage < 30) {
                    // 体力不足时显示红色
                    progressBarSprite.color = new Color(255, 0, 0, 255);
                } else if (energyInfo.percentage < 70) {
                    // 体力中等时显示黄色
                    progressBarSprite.color = new Color(255, 255, 0, 255);
                } else {
                    // 体力充足时显示绿色
                    progressBarSprite.color = new Color(0, 255, 0, 255);
                }
            }
        }
    }

    /**
     * 显示体力提示
     */
    private showEnergyTip(message: string): void {
        if (this.energyTipNode && this.energyTipLabel) {
            this.energyTipLabel.string = message;
            this.energyTipNode.active = true;
            
            // 添加闪烁动画
            this.energyTipNode.setScale(new Vec3(1, 1, 1));
            tween(this.energyTipNode)
                .to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
                .to(0.5, { scale: new Vec3(1, 1, 1) })
                .union()
                .repeatForever()
                .start();
        }
    }

    /**
     * 隐藏体力提示
     */
    private hideEnergyTip(): void {
        if (this.energyTipNode) {
            this.energyTipNode.active = false;
        }
    }

    /**
     * 显示购买面板
     */
    private showPurchasePanel(): void {
        if (this.purchasePanel) {
            this.purchasePanel.active = true;
            this.updatePurchasePanel();
        }
    }

    /**
     * 隐藏购买面板
     */
    private hidePurchasePanel(): void {
        if (this.purchasePanel) {
            this.purchasePanel.active = false;
        }
    }

    /**
     * 更新购买面板
     */
    private updatePurchasePanel(): void {
        if (!this.energyManager) return;

        const purchaseConfigs = this.energyManager.getEnergyPurchaseConfigs();
        
        // 更新广告按钮
        const adConfig = purchaseConfigs.find(c => c.type === 'ad');
        if (adConfig && this.adButton) {
            const adLabel = this.adButton.getComponentInChildren(Label);
            if (adLabel) {
                adLabel.string = `观看广告\n获得${adConfig.energyAmount}体力`;
            }
        }

        // 更新付费按钮
        const paidConfigs = purchaseConfigs.filter(c => c.type === 'paid');
        for (let i = 0; i < this.purchaseButtons.length && i < paidConfigs.length; i++) {
            const button = this.purchaseButtons[i];
            const config = paidConfigs[i];
            const buttonLabel = button.getComponentInChildren(Label);
            if (buttonLabel) {
                buttonLabel.string = `${config.price}元\n获得${config.energyAmount}体力`;
            }
        }
    }

    /**
     * 广告按钮点击
     */
    public onAdButtonClick(): void {
        if (!this.energyManager) return;

        this.energyManager.gainEnergyByAd().then((success) => {
            if (success) {
                this.hidePurchasePanel();
                this.hideEnergyTip();
            }
        });
    }

    /**
     * 付费按钮点击
     */
    public onPurchaseButtonClick(event: any, customData: string): void {
        if (!this.energyManager) return;

        const purchaseId = parseInt(customData);
        this.energyManager.gainEnergyByPurchase(purchaseId).then((success) => {
            if (success) {
                this.hidePurchasePanel();
                this.hideEnergyTip();
            }
        });
    }

    /**
     * 关闭购买面板
     */
    public onClosePurchasePanel(): void {
        this.hidePurchasePanel();
    }

    /**
     * 测试消耗体力
     */
    public testConsumeEnergy(): void {
        if (this.energyManager) {
            this.energyManager.consumeEnergy(10);
        }
    }

    /**
     * 测试重置体力
     */
    public testResetEnergy(): void {
        if (this.energyManager) {
            this.energyManager.resetEnergyState();
        }
    }
} 