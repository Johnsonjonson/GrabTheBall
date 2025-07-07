import { _decorator, Component, Node } from 'cc';
import { Log } from '../Framework/Log/Logger';
import { LevelManager } from './LevelManager';

const { ccclass, property } = _decorator;

// 体力购买配置接口
export interface EnergyPurchaseConfig {
    id: number;
    type: 'ad' | 'paid';
    energyAmount: number;
    price: number;
    description: string;
}

// 体力状态接口
export interface EnergyState {
    currentEnergy: number;
    maxEnergy: number;
    lastRecoveryTime: number;
}

// 体力不足回调
export type EnergyInsufficientCallback = (remainingTime: string, recoveryAmount: number) => void;

// 体力变化回调
export type EnergyChangeCallback = (currentEnergy: number, maxEnergy: number) => void;

@ccclass('EnergyManager')
export class EnergyManager extends Component {
    private static _instance: EnergyManager = null;
    
    public static get instance(): EnergyManager {
        return EnergyManager._instance;
    }

    // 体力购买配置数据
    private energyPurchaseConfigs: EnergyPurchaseConfig[] = [];
    
    // 当前体力状态
    private energyState: EnergyState = {
        currentEnergy: 100,
        maxEnergy: 100,
        lastRecoveryTime: Date.now()
    };

    // 回调函数
    private onEnergyInsufficient: EnergyInsufficientCallback = null;
    private onEnergyChange: EnergyChangeCallback = null;

    // 存储键名
    private readonly ENERGY_STATE_KEY = 'energy_state';

    protected onLoad(): void {
        if (EnergyManager._instance === null) {
            EnergyManager._instance = this;
        } else {
            this.node.destroy();
            return;
        }

        this.initEnergyPurchaseConfigs();
        this.loadEnergyState();
        this.startRecoveryTimer();
    }

    /**
     * 初始化体力购买配置
     */
    private initEnergyPurchaseConfigs(): void {
        // 体力购买配置
        this.energyPurchaseConfigs = [
            { id: 1, type: 'ad', energyAmount: 20, price: 0, description: '观看广告获得20体力' },
            { id: 2, type: 'paid', energyAmount: 50, price: 1, description: '付费1元获得50体力' },
            { id: 3, type: 'paid', energyAmount: 100, price: 2, description: '付费2元获得100体力' },
            { id: 4, type: 'paid', energyAmount: 200, price: 5, description: '付费5元获得200体力' }
        ];
    }

    /**
     * 加载体力状态
     */
    public loadEnergyState(): void {
        try {
            const savedState = localStorage.getItem(this.ENERGY_STATE_KEY);
            if (savedState) {
                this.energyState = JSON.parse(savedState);
                this.checkAndRecoverEnergy();
            } else {
                // 默认满体力
                this.energyState.currentEnergy = this.getCurrentEnergyLimit();
                this.energyState.maxEnergy = this.getCurrentEnergyLimit();
            }
        } catch (error) {
            Log.e('加载体力状态失败:', error);
            this.energyState.currentEnergy = this.getCurrentEnergyLimit();
            this.energyState.maxEnergy = this.getCurrentEnergyLimit();
        }
    }

    public getEnergyState(): EnergyState {
        return this.energyState;
    }

    /**
     * 保存体力状态
     */
    private saveEnergyState(): void {
        try {
            localStorage.setItem(this.ENERGY_STATE_KEY, JSON.stringify(this.energyState));
        } catch (error) {
            Log.e('保存体力状态失败:', error);
        }
    }

    /**
     * 获取当前体力上限（从等级管理器获取）
     */
    private getCurrentEnergyLimit(): number {
        const levelManager = LevelManager.instance;
        return levelManager ? levelManager.getCurrentEnergyLimit() : 100;
    }

    /**
     * 获取当前体力恢复速度（从等级管理器获取）
     */
    private getCurrentRecoveryPerHour(): number {
        const levelManager = LevelManager.instance;
        return levelManager ? levelManager.getCurrentRecoveryPerHour() : 10;
    }

    /**
     * 检查并恢复体力
     */
    private checkAndRecoverEnergy(): void {
        const now = Date.now();
        const timeDiff = now - this.energyState.lastRecoveryTime;
        const hoursDiff = timeDiff / (1000 * 60 * 60); // 转换为小时

        if (hoursDiff >= 1) {
            const recoveryPerHour = this.getCurrentRecoveryPerHour();
            const recoveryAmount = Math.floor(hoursDiff) * recoveryPerHour;
            const maxEnergy = this.getCurrentEnergyLimit();
            const newEnergy = this.energyState.currentEnergy + recoveryAmount;
            
            // 检查是否超过上限
            if (newEnergy >= maxEnergy) {
                // 计算实际恢复量（不超过上限）
                const actualRecovery = maxEnergy - this.energyState.currentEnergy;
                this.energyState.currentEnergy = maxEnergy;
                Log.i(`体力已恢复满，实际恢复: ${actualRecovery}点`);
            } else {
                this.energyState.currentEnergy = newEnergy;
                Log.i(`体力恢复: ${recoveryAmount}点，当前体力: ${this.energyState.currentEnergy}`);
            }
            
            this.energyState.lastRecoveryTime = now;
            this.saveEnergyState();
            this.notifyEnergyChange();
        }
    }

    /**
     * 开始恢复计时器
     */
    private startRecoveryTimer(): void {
        // 每分钟检查一次体力恢复
        setInterval(() => {
            this.checkAndRecoverEnergy();
        }, 60000); // 60秒
    }

    /**
     * 消耗体力
     */
    public consumeEnergy(amount: number): boolean {
        if (this.energyState.currentEnergy >= amount) {
            this.energyState.currentEnergy -= amount;
            this.saveEnergyState();
            this.notifyEnergyChange();
            Log.i(`消耗体力: ${amount}点，剩余: ${this.energyState.currentEnergy}`);
            return true;
        } else {
            this.handleEnergyInsufficient();
            return false;
        }
    }

    /**
     * 处理体力不足
     */
    private handleEnergyInsufficient(): void {
        Log.i('体力不足！');
        const recoveryPerHour = this.getCurrentRecoveryPerHour();
        const maxEnergy = this.getCurrentEnergyLimit();

        const now = Date.now();
        const timeDiff = now - this.energyState.lastRecoveryTime;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // 计算下次恢复时间
        const nextRecoveryTime = this.energyState.lastRecoveryTime + (1000 * 60 * 60); // 1小时后
        const remainingTime = nextRecoveryTime - now;
        
        // 计算恢复量
        let recoveryAmount = recoveryPerHour;
        
        // 检查是否还差1点体力达到满体力，且下一次能直接恢复5点体力
        const neededEnergy = maxEnergy - this.energyState.currentEnergy;
        if (neededEnergy === 1 && recoveryAmount >= 5) {
            recoveryAmount = neededEnergy; // 只恢复1点，达到满体力
        }
        
        const remainingTimeStr = this.formatTime(remainingTime);
        
        Log.w(`体力不足！还需等待: ${remainingTimeStr} 恢复 ${recoveryAmount} 点体力`);
        
        if (this.onEnergyInsufficient) {
            this.onEnergyInsufficient(remainingTimeStr, recoveryAmount);
        }
    }

    /**
     * 通过广告获得体力
     */
    public gainEnergyByAd(): Promise<boolean> {
        return new Promise((resolve) => {
            const adConfig = this.energyPurchaseConfigs.find(c => c.type === 'ad');
            if (adConfig) {
                // 模拟广告观看
                Log.i('开始观看广告...');
                setTimeout(() => {
                    this.addEnergy(adConfig.energyAmount);
                    Log.i(`广告观看完成，获得体力: ${adConfig.energyAmount}点`);
                    resolve(true);
                }, 3000); // 模拟3秒广告
            } else {
                resolve(false);
            }
        });
    }

    /**
     * 通过付费获得体力
     */
    public gainEnergyByPurchase(purchaseId: number): Promise<boolean> {
        return new Promise((resolve) => {
            const purchaseConfig = this.energyPurchaseConfigs.find(c => c.id === purchaseId && c.type === 'paid');
            if (purchaseConfig) {
                // 模拟付费购买
                Log.i(`开始付费购买体力，价格: ${purchaseConfig.price}元`);
                // 这里应该调用实际的付费接口
                setTimeout(() => {
                    this.addEnergy(purchaseConfig.energyAmount);
                    Log.i(`付费购买完成，获得体力: ${purchaseConfig.energyAmount}点`);
                    resolve(true);
                }, 1000);
            } else {
                resolve(false);
            }
        });
    }

    /**
     * 添加体力
     */
    public addEnergy(amount: number): void {
        this.energyState.currentEnergy += amount;
        this.saveEnergyState();
        this.notifyEnergyChange();
        Log.i(`获得体力: ${amount}点，当前体力: ${this.energyState.currentEnergy}`);
    }

    /**
     * 获取当前体力信息
     */
    public getEnergyInfo(): { current: number; max: number; percentage: number; displayText: string } {
        const maxEnergy = this.getCurrentEnergyLimit();
        const percentage = Math.min(100, (this.energyState.currentEnergy / maxEnergy) * 100);
        
        let displayText: string;
        if (this.energyState.currentEnergy > maxEnergy) {
            // 体力超出上限时
            displayText = `${this.energyState.currentEnergy}`;
        } else {
            // 体力未达上限时
            displayText = `${this.energyState.currentEnergy}/${maxEnergy}`;
        }
        
        return {
            current: this.energyState.currentEnergy,
            max: maxEnergy,
            percentage: percentage,
            displayText: displayText
        };
    }

    /**
     * 获取体力不足时的恢复信息
     */
    public getRecoveryInfo(): { remainingTime: string; recoveryAmount: number } {
        const recoveryPerHour = this.getCurrentRecoveryPerHour();
        const maxEnergy = this.getCurrentEnergyLimit();

        const now = Date.now();
        const nextRecoveryTime = this.energyState.lastRecoveryTime + (1000 * 60 * 60);
        const remainingTime = Math.max(0, nextRecoveryTime - now);
        
        if (remainingTime <= 0) {
            // 体力值加 recoveryPerHour
            this.energyState.currentEnergy += recoveryPerHour;
            this.energyState.lastRecoveryTime = nextRecoveryTime;
            this.saveEnergyState();
            this.notifyEnergyChange();
            // 重新开启恢复计时器
            this.startRecoveryTimer();
            return {
                remainingTime: '00:00:00',
                recoveryAmount: 0
            };
        }
        let recoveryAmount = recoveryPerHour;
        const neededEnergy = maxEnergy - this.energyState.currentEnergy;
        if (neededEnergy === 1 && recoveryAmount >= 5) {
            recoveryAmount = neededEnergy;
        }
        
        return {
            remainingTime: this.formatTime(remainingTime),
            recoveryAmount: recoveryAmount
        };
    }

    /**
     * 格式化时间
     */
    private formatTime(milliseconds: number): string {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
        const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }

    /**
     * 设置体力不足回调
     */
    public setEnergyInsufficientCallback(callback: EnergyInsufficientCallback): void {
        this.onEnergyInsufficient = callback;
    }

    /**
     * 设置体力变化回调
     */
    public setEnergyChangeCallback(callback: EnergyChangeCallback): void {
        this.onEnergyChange = callback;
    }

    /**
     * 通知体力变化
     */
    private notifyEnergyChange(): void {
        if (this.onEnergyChange) {
            const maxEnergy = this.getCurrentEnergyLimit();
            this.onEnergyChange(this.energyState.currentEnergy, maxEnergy);
        }
    }

    /**
     * 获取体力购买配置
     */
    public getEnergyPurchaseConfigs(): EnergyPurchaseConfig[] {
        return this.energyPurchaseConfigs;
    }

    /**
     * 检查是否有足够体力
     */
    public hasEnoughEnergy(amount: number): boolean {
        return this.energyState.currentEnergy >= amount;
    }

    /**
     * 重置体力状态（用于测试）
     */
    public resetEnergyState(): void {
        const maxEnergy = this.getCurrentEnergyLimit();
        this.energyState = {
            currentEnergy: maxEnergy,
            maxEnergy: maxEnergy,
            lastRecoveryTime: Date.now()
        };
        this.saveEnergyState();
        this.notifyEnergyChange();
    }

    /**
     * 等级变化时更新体力上限
     */
    public onLevelChanged(): void {
        const maxEnergy = this.getCurrentEnergyLimit();
        // 如果当前体力超过新上限，保持当前值（可以超出上限）
        if (this.energyState.currentEnergy > maxEnergy) {
            // 超出上限的情况，保持当前值
        } else {
            // 未超出上限，设置为满体力
            this.energyState.currentEnergy = maxEnergy;
        }
        
        this.saveEnergyState();
        this.notifyEnergyChange();
        Log.i(`等级变化，体力上限更新为: ${maxEnergy}`);
    }
} 