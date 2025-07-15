import { _decorator, Component, Node } from 'cc';
import { Log } from '../Framework/Log/Logger';
import { LevelManager } from './LevelManager';
import { EnergyManager } from './EnergyManager';

const { ccclass, property } = _decorator;

// BET配置接口
export interface BetConfig {
    bet: number;
    energyCost: number;
    unlockLevel: number;
    description: string;
}

// BET状态接口
export interface BetState {
    currentBet: number;
    availableBets: number[];
    maxAvailableBet: number;
}

@ccclass('BetManager')
export class BetManager extends Component {
    private static _instance: BetManager = null;
    public static get instance(): BetManager {
        return BetManager._instance;
    }

    // BET配置数据
    private betConfigs: BetConfig[] = [];
    
    // 当前BET状态
    private betState: BetState = {
        currentBet: 1,
        availableBets: [1],
        maxAvailableBet: 1
    };

    // 回调函数
    private onBetChange: (newBet: number) => void = null;

    // 存储键名
    private readonly BET_STATE_KEY = 'player_bet_state';

    protected onLoad(): void {
        if (BetManager._instance === null) {
            BetManager._instance = this;
        } else {
            this.node.destroy();
            return;
        }

        this.initBetConfigs();
        this.loadBetState();
        this.updateAvailableBetsInternal();
        
        // 设置体力变化回调
        EnergyManager.instance.setEnergyChangeCallback(this.onEnergyChanged.bind(this));
        
        // 设置等级变化回调
        LevelManager.instance.setLevelChangeCallback(this.onLevelChanged.bind(this));
    }

    /**
     * 初始化BET配置
     */
    private initBetConfigs(): void {
        this.betConfigs = [
            { bet: 1, energyCost: 1, unlockLevel: 1, description: '1倍抓取，消耗1点体力' },
            { bet: 2, energyCost: 2, unlockLevel: 1, description: '2倍抓取，消耗2点体力' },
            { bet: 3, energyCost: 3, unlockLevel: 2, description: '3倍抓取，消耗3点体力' },
            { bet: 5, energyCost: 5, unlockLevel: 3, description: '5倍抓取，消耗5点体力' },
            { bet: 10, energyCost: 10, unlockLevel: 5, description: '10倍抓取，消耗10点体力' },
            { bet: 20, energyCost: 20, unlockLevel: 8, description: '20倍抓取，消耗20点体力' },
            { bet: 50, energyCost: 50, unlockLevel: 10, description: '50倍抓取，消耗50点体力' }
        ];
    }

    /**
     * 加载BET状态
     */
    private loadBetState(): void {
        Log.i('加载BET状态');
        try {
            const savedState = localStorage.getItem(this.BET_STATE_KEY);
            if (savedState) {
                const savedBetState = JSON.parse(savedState);
                this.betState.currentBet = savedBetState.currentBet || 1;
                Log.i('加载BET状态成功，当前BET: ' + this.betState.currentBet);
            } else {
                // 默认1BET
                this.betState.currentBet = 1;
                Log.i('加载BET状态失败，设置为1BET');
            }
        } catch (error) {
            Log.e('加载BET状态失败:', error);
            this.betState.currentBet = 1;
        }
    }

    /**
     * 保存BET状态
     */
    private saveBetState(): void {
        try {
            const stateToSave = {
                currentBet: this.betState.currentBet
            };
            localStorage.setItem(this.BET_STATE_KEY, JSON.stringify(stateToSave));
            Log.i('保存BET状态成功');
        } catch (error) {
            Log.e('保存BET状态失败:', error);
        }
    }

    /**
     * 更新可用BET列表
     */
    private updateAvailableBetsInternal(): void {
        const currentLevel = LevelManager.instance.getPlayerLevelInfo().level;
        const currentEnergy = EnergyManager.instance.getEnergyState().currentEnergy;
        
        this.betState.availableBets = [];
        this.betState.maxAvailableBet = 1;

        // 根据等级和体力筛选可用BET
        for (const config of this.betConfigs) {
            if (config.unlockLevel <= currentLevel && config.energyCost <= currentEnergy) {
                this.betState.availableBets.push(config.bet);
                if (config.bet > this.betState.maxAvailableBet) {
                    this.betState.maxAvailableBet = config.bet;
                }
            }
        }

        // 如果当前BET不可用，自动调整到最大可用BET
        if (this.betState.availableBets.indexOf(this.betState.currentBet) === -1) {
            this.betState.currentBet = this.betState.maxAvailableBet;
            this.saveBetState();
            if (this.onBetChange) {
                this.onBetChange(this.betState.currentBet);
            }
        }

        Log.i('更新可用BET列表: ' + this.betState.availableBets.join(', ') + ', 最大可用BET: ' + this.betState.maxAvailableBet);
    }

    /**
     * 设置BET变化回调
     */
    public setBetChangeCallback(callback: (newBet: number) => void): void {
        this.onBetChange = callback;
    }

    /**
     * 切换到下一个BET
     */
    public switchToNextBet(): void {
        if (this.betState.availableBets.length === 0) {
            Log.w('没有可用的BET');
            return;
        }

        const currentIndex = this.betState.availableBets.indexOf(this.betState.currentBet);
        const nextIndex = (currentIndex + 1) % this.betState.availableBets.length;
        const newBet = this.betState.availableBets[nextIndex];

        this.setCurrentBet(newBet);
        Log.i('切换到下一个BET: ' + newBet);
    }

    /**
     * 设置当前BET
     */
    public setCurrentBet(bet: number): void {
        if (this.betState.availableBets.indexOf(bet) === -1) {
            Log.w('BET ' + bet + ' 不可用');
            return;
        }

        this.betState.currentBet = bet;
        this.saveBetState();
        
        if (this.onBetChange) {
            this.onBetChange(bet);
        }

        Log.i('设置当前BET: ' + bet);
    }

    /**
     * 获取当前BET
     */
    public getCurrentBet(): number {
        return this.betState.currentBet;
    }

    /**
     * 获取当前BET配置
     */
    public getCurrentBetConfig(): BetConfig | null {
        return this.betConfigs.find(c => c.bet === this.betState.currentBet) || null;
    }

    /**
     * 获取可用BET列表
     */
    public getAvailableBets(): number[] {
        return [...this.betState.availableBets];
    }

    /**
     * 获取最大可用BET
     */
    public getMaxAvailableBet(): number {
        return this.betState.maxAvailableBet;
    }

    /**
     * 检查BET是否可用
     */
    public isBetAvailable(bet: number): boolean {
        return this.betState.availableBets.indexOf(bet) !== -1;
    }

    /**
     * 获取BET配置
     */
    public getBetConfig(bet: number): BetConfig | null {
        return this.betConfigs.find(c => c.bet === bet) || null;
    }

    /**
     * 获取所有BET配置
     */
    public getAllBetConfigs(): BetConfig[] {
        return [...this.betConfigs];
    }

    /**
     * 计算奖励（根据BET倍数）
     */
    public calculateReward(baseReward: number, isSpecialItem: boolean = false): number {
        if (isSpecialItem) {
            // 特殊物品不参与倍数增加
            return baseReward;
        }
        
        return baseReward * this.betState.currentBet;
    }

    /**
     * 消耗体力（根据当前BET）
     */
    public consumeEnergy(): boolean {
        const config = this.getCurrentBetConfig();
        if (!config) {
            Log.e('无法获取当前BET配置');
            return false;
        }

        return EnergyManager.instance.consumeEnergy(config.energyCost);
    }

    /**
     * 检查是否有足够体力进行当前BET
     */
    public hasEnoughEnergy(): boolean {
        const config = this.getCurrentBetConfig();
        if (!config) {
            return false;
        }

        const energyState = EnergyManager.instance.getEnergyState();
        return energyState.currentEnergy >= config.energyCost;
    }

    /**
     * 更新可用BET（当体力或等级变化时调用）
     */
    public updateAvailableBets(): void {
        this.updateAvailableBetsInternal();
    }

    /**
     * 体力变化回调
     */
    private onEnergyChanged(currentEnergy: number, maxEnergy: number): void {
        this.updateAvailableBetsInternal();
    }

    /**
     * 等级变化回调
     */
    private onLevelChanged(oldLevel: number, newLevel: number, exp: number): void {
        this.updateAvailableBetsInternal();
    }

    /**
     * 重置BET状态
     */
    public resetBetState(): void {
        this.betState.currentBet = 1;
        this.saveBetState();
        this.updateAvailableBetsInternal();
        
        if (this.onBetChange) {
            this.onBetChange(1);
        }
        
        Log.i('重置BET状态');
    }
} 