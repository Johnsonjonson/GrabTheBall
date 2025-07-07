import { _decorator, Component, Node } from 'cc';
import { Log } from '../Framework/Log/Logger';

const { ccclass, property } = _decorator;

// 等级配置接口
export interface LevelConfig {
    level: number;
    expRequired: number;
    energyLimit: number;
    recoveryPerHour: number;
    description: string;
}

// 玩家等级状态接口
export interface PlayerLevelState {
    level: number;
    exp: number;
    totalExp: number;
}

// 等级变化回调
export type LevelChangeCallback = (oldLevel: number, newLevel: number, exp: number) => void;

@ccclass('LevelManager')
export class LevelManager extends Component {
    private static _instance: LevelManager = null;
    
    public static get instance(): LevelManager {
        return LevelManager._instance;
    }

    // 等级配置数据
    private levelConfigs: LevelConfig[] = [];
    
    // 玩家等级状态
    private playerLevelState: PlayerLevelState = {
        level: 1,
        exp: 0,
        totalExp: 0
    };

    // 回调函数
    private onLevelChange: LevelChangeCallback = null;

    // 存储键名
    private readonly LEVEL_STATE_KEY = 'player_level_state';

    protected onLoad(): void {
        if (LevelManager._instance === null) {
            LevelManager._instance = this;
        } else {
            this.node.destroy();
            return;
        }

        this.initLevelConfigs();
        this.loadPlayerLevelState();
    }

    /**
     * 初始化等级配置
     */
    private initLevelConfigs(): void {
        this.levelConfigs = [
            { level: 1, expRequired: 0, energyLimit: 100, recoveryPerHour: 10, description: '1级：体力上限100，每小时恢复10点' },
            { level: 2, expRequired: 1000, energyLimit: 120, recoveryPerHour: 12, description: '2级：体力上限120，每小时恢复12点' },
            { level: 3, expRequired: 3000, energyLimit: 140, recoveryPerHour: 14, description: '3级：体力上限140，每小时恢复14点' },
            { level: 4, expRequired: 6000, energyLimit: 160, recoveryPerHour: 16, description: '4级：体力上限160，每小时恢复16点' },
            { level: 5, expRequired: 10000, energyLimit: 180, recoveryPerHour: 18, description: '5级：体力上限180，每小时恢复18点' },
            { level: 6, expRequired: 15000, energyLimit: 200, recoveryPerHour: 20, description: '6级：体力上限200，每小时恢复20点' },
            { level: 7, expRequired: 21000, energyLimit: 220, recoveryPerHour: 22, description: '7级：体力上限220，每小时恢复22点' },
            { level: 8, expRequired: 28000, energyLimit: 240, recoveryPerHour: 24, description: '8级：体力上限240，每小时恢复24点' },
            { level: 9, expRequired: 36000, energyLimit: 260, recoveryPerHour: 26, description: '9级：体力上限260，每小时恢复26点' },
            { level: 10, expRequired: 45000, energyLimit: 280, recoveryPerHour: 28, description: '10级：体力上限280，每小时恢复28点' }
        ];
    }

    /**
     * 加载玩家等级状态
     */
    private loadPlayerLevelState(): void {
        Log.i('加载玩家等级状态');
        try {
            const savedState = localStorage.getItem(this.LEVEL_STATE_KEY);
            if (savedState) {
                this.playerLevelState = JSON.parse(savedState);
                Log.i('加载玩家等级状态成功');
            } else {
                // 默认1级
                this.playerLevelState = {
                    level: 1,
                    exp: 0,
                    totalExp: 0
                };
                Log.i('加载玩家等级状态失败，设置为1级');
            }
        } catch (error) {
            Log.e('加载玩家等级状态失败:', error);
            this.playerLevelState = {
                level: 1,
                exp: 0,
                totalExp: 0
            };
        }
    }

    /**
     * 保存玩家等级状态
     */
    private savePlayerLevelState(): void {
        try {
            localStorage.setItem(this.LEVEL_STATE_KEY, JSON.stringify(this.playerLevelState));
        } catch (error) {
            Log.e('保存玩家等级状态失败:', error);
        }
    }

    /**
     * 添加经验值
     */
    public addExp(expAmount: number): void {
        const oldLevel = this.playerLevelState.level;
        this.playerLevelState.exp += expAmount;
        this.playerLevelState.totalExp += expAmount;

        // 检查是否升级
        this.checkLevelUp();

        this.savePlayerLevelState();

        // 通知等级变化
        if (this.playerLevelState.level > oldLevel) {
            this.notifyLevelChange(oldLevel, this.playerLevelState.level, this.playerLevelState.exp);
        }
    }

    /**
     * 检查升级
     */
    private checkLevelUp(): void {
        const currentLevel = this.playerLevelState.level;
        const currentExp = this.playerLevelState.exp;

        // 查找当前等级配置
        const currentConfig = this.levelConfigs.find(c => c.level === currentLevel);
        if (!currentConfig) return;

        // 查找下一级配置
        const nextConfig = this.levelConfigs.find(c => c.level === currentLevel + 1);
        if (!nextConfig) return; // 已达到最高等级

        // 检查是否达到升级条件
        if (currentExp >= nextConfig.expRequired) {
            this.playerLevelState.level = nextConfig.level;
            Log.i(`恭喜升级！当前等级: ${nextConfig.level}`);
            
            // 递归检查是否连续升级
            this.checkLevelUp();
        }
    }

    /**
     * 获取当前等级配置
     */
    public getCurrentLevelConfig(): LevelConfig | null {
        return this.levelConfigs.find(c => c.level === this.playerLevelState.level) || null;
    }

    /**
     * 获取指定等级配置
     */
    public getLevelConfig(level: number): LevelConfig | null {
        return this.levelConfigs.find(c => c.level === level) || null;
    }

    /**
     * 获取当前体力上限
     */
    public getCurrentEnergyLimit(): number {
        const config = this.getCurrentLevelConfig();
        return config ? config.energyLimit : 100;
    }

    /**
     * 获取当前体力恢复速度
     */
    public getCurrentRecoveryPerHour(): number {
        const config = this.getCurrentLevelConfig();
        return config ? config.recoveryPerHour : 10;
    }

    /**
     * 获取玩家等级信息
     */
    public getPlayerLevelInfo(): { level: number; exp: number; totalExp: number; nextLevelExp: number; expProgress: number } {
        const currentConfig = this.getCurrentLevelConfig();
        const nextConfig = this.getLevelConfig(this.playerLevelState.level + 1);

        let nextLevelExp = 0;
        let expProgress = 0;

        if (nextConfig) {
            nextLevelExp = nextConfig.expRequired;
            const currentLevelExp = currentConfig ? currentConfig.expRequired : 0;
            const expNeeded = nextLevelExp - currentLevelExp;
            const currentExp = this.playerLevelState.exp - currentLevelExp;
            expProgress = expNeeded > 0 ? (currentExp / expNeeded) * 100 : 100;
        } else {
            // 已达到最高等级
            expProgress = 100;
        }

        return {
            level: this.playerLevelState.level,
            exp: this.playerLevelState.exp,
            totalExp: this.playerLevelState.totalExp,
            nextLevelExp: nextLevelExp,
            expProgress: Math.min(100, Math.max(0, expProgress))
        };
    }

    /**
     * 获取所有等级配置
     */
    public getAllLevelConfigs(): LevelConfig[] {
        return this.levelConfigs;
    }

    /**
     * 设置等级变化回调
     */
    public setLevelChangeCallback(callback: LevelChangeCallback): void {
        this.onLevelChange = callback;
    }

    /**
     * 通知等级变化
     */
    private notifyLevelChange(oldLevel: number, newLevel: number, exp: number): void {
        if (this.onLevelChange) {
            this.onLevelChange(oldLevel, newLevel, exp);
        }
    }

    /**
     * 重置玩家等级（用于测试）
     */
    public resetPlayerLevel(): void {
        this.playerLevelState = {
            level: 1,
            exp: 0,
            totalExp: 0
        };
        this.savePlayerLevelState();
        Log.i('玩家等级已重置为1级');
    }

    /**
     * 设置玩家等级（用于测试）
     */
    public setPlayerLevel(level: number): void {
        const config = this.getLevelConfig(level);
        if (config) {
            const oldLevel = this.playerLevelState.level;
            this.playerLevelState.level = level;
            this.playerLevelState.exp = config.expRequired;
            this.savePlayerLevelState();
            
            if (oldLevel !== level) {
                this.notifyLevelChange(oldLevel, level, this.playerLevelState.exp);
            }
            
            Log.i(`玩家等级设置为: ${level}级`);
        } else {
            Log.e(`无效的等级: ${level}`);
        }
    }

    /**
     * 获取当前等级
     */
    public getCurrentLevel(): number {
        return this.playerLevelState.level;
    }

    /**
     * 获取当前经验值
     */
    public getCurrentExp(): number {
        return this.playerLevelState.exp;
    }

    /**
     * 获取总经验值
     */
    public getTotalExp(): number {
        return this.playerLevelState.totalExp;
    }
} 