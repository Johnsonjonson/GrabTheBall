# 体力系统 (Energy System)

## 概述

这是一个完整的体力管理系统，支持等级相关的体力上限配置、自动恢复、体力不足处理、广告和付费获得体力等功能。

## 系统架构

### 核心组件

1. **LevelManager** - 等级管理器
   - 管理玩家等级和经验值
   - 提供等级相关的体力配置
   - 支持等级变化回调

2. **EnergyManager** - 体力管理器
   - 管理体力状态和恢复
   - 处理体力消耗和获得
   - 与等级管理器联动

3. **EnergyUI** - 体力UI组件
   - 显示体力信息
   - 提供购买和广告按钮
   - 显示恢复进度

## 等级系统

### 等级配置

等级配置存储在 `assets/resources/config/level.xlsx` 中，包含：

| 字段 | 说明 |
|------|------|
| level | 等级 |
| expRequired | 升级所需经验值 |
| energyLimit | 该等级的体力上限 |
| recoveryPerHour | 每小时体力恢复量 |
| description | 描述 |

### 等级配置示例

```csv
level,expRequired,energyLimit,recoveryPerHour,description
1,0,100,10,1级：体力上限100，每小时恢复10点
2,1000,120,12,2级：体力上限120，每小时恢复12点
3,3000,140,14,3级：体力上限140，每小时恢复14点
```

### 等级管理器功能

- **经验值管理**: 添加经验值、检查升级
- **等级配置**: 获取当前等级配置、体力上限、恢复速度
- **状态持久化**: 自动保存和加载等级状态
- **回调通知**: 等级变化时通知相关系统

## 体力系统

### 体力上限与等级关联

体力上限不再独立配置，而是根据玩家等级自动获取：

```typescript
// 获取当前体力上限
const energyLimit = LevelManager.instance.getCurrentEnergyLimit();

// 获取当前恢复速度
const recoveryPerHour = LevelManager.instance.getCurrentRecoveryPerHour();
```

### 体力状态

体力状态包含：
- `currentEnergy`: 当前体力值
- `lastRecoveryTime`: 上次恢复时间

### 体力恢复机制

1. **自动恢复**: 每小时自动恢复指定数量的体力
2. **等级相关**: 恢复速度随等级提升而增加
3. **上限控制**: 恢复不超过当前等级的上限（除非通过广告/购买获得）

### 特殊恢复逻辑

当体力差1点达到满体力时，且下一次恢复量≥5点时，只恢复1点达到满体力。

## 体力购买系统

### 购买配置

购买配置支持两种类型：
- **广告**: 免费观看广告获得体力
- **付费**: 付费购买体力

### 配置示例

```typescript
[
    { id: 1, type: 'ad', energyAmount: 20, price: 0, description: '观看广告获得20体力' },
    { id: 2, type: 'paid', energyAmount: 50, price: 1, description: '付费1元获得50体力' },
    { id: 3, type: 'paid', energyAmount: 100, price: 2, description: '付费2元获得100体力' }
]
```

### 体力超出上限

通过广告或购买获得的体力可以超出当前等级的上限，显示格式为：
- 未达上限: `当前体力/上限体力`
- 超出上限: `当前体力`

## API 参考

### LevelManager

#### 主要方法

```typescript
// 获取单例实例
LevelManager.instance

// 添加经验值
addExp(expAmount: number): void

// 获取当前等级
getCurrentLevel(): number

// 获取当前经验值
getCurrentExp(): number

// 获取当前体力上限
getCurrentEnergyLimit(): number

// 获取当前恢复速度
getCurrentRecoveryPerHour(): number

// 获取玩家等级信息
getPlayerLevelInfo(): {
    level: number;
    exp: number;
    totalExp: number;
    nextLevelExp: number;
    expProgress: number;
}

// 设置等级变化回调
setLevelChangeCallback(callback: (oldLevel: number, newLevel: number, exp: number) => void): void

// 重置玩家等级（测试用）
resetPlayerLevel(): void

// 设置玩家等级（测试用）
setPlayerLevel(level: number): void
```

### EnergyManager

#### 主要方法

```typescript
// 获取单例实例
EnergyManager.instance

// 消耗体力
consumeEnergy(amount: number): boolean

// 添加体力
addEnergy(amount: number): void

// 通过广告获得体力
gainEnergyByAd(): Promise<boolean>

// 通过付费获得体力
gainEnergyByPurchase(purchaseId: number): Promise<boolean>

// 获取体力信息
getEnergyInfo(): {
    current: number;
    max: number;
    percentage: number;
    displayText: string;
}

// 获取恢复信息
getRecoveryInfo(): {
    remainingTime: string;
    recoveryAmount: number;
}

// 检查是否有足够体力
hasEnoughEnergy(amount: number): boolean

// 设置体力不足回调
setEnergyInsufficientCallback(callback: (remainingTime: string, recoveryAmount: number) => void): void

// 设置体力变化回调
setEnergyChangeCallback(callback: (currentEnergy: number, maxEnergy: number) => void): void

// 等级变化时更新体力（内部调用）
onLevelChanged(): void
```

## 使用示例

### 基本使用

```typescript
import { EnergyManager } from './EnergyManager';
import { LevelManager } from './LevelManager';

// 检查体力是否足够
if (EnergyManager.instance.hasEnoughEnergy(10)) {
    // 消耗体力
    EnergyManager.instance.consumeEnergy(10);
    // 执行游戏逻辑
} else {
    // 处理体力不足
    console.log('体力不足！');
}

// 添加经验值
LevelManager.instance.addExp(100);
```

### 设置回调

```typescript
// 设置体力不足回调
EnergyManager.instance.setEnergyInsufficientCallback((remainingTime, recoveryAmount) => {
    console.log(`体力不足！还需等待 ${remainingTime} 恢复 ${recoveryAmount} 点体力`);
    // 显示购买体力窗口
});

// 设置等级变化回调
LevelManager.instance.setLevelChangeCallback((oldLevel, newLevel, exp) => {
    console.log(`等级提升: ${oldLevel} -> ${newLevel}`);
    // 显示升级提示
});
```

### 广告和购买

```typescript
// 观看广告获得体力
EnergyManager.instance.gainEnergyByAd().then((success) => {
    if (success) {
        console.log('广告观看完成，获得体力');
    }
});

// 付费购买体力
EnergyManager.instance.gainEnergyByPurchase(2).then((success) => {
    if (success) {
        console.log('购买完成，获得体力');
    }
});
```

## UI 组件

### EnergyUI

提供完整的体力UI界面，包括：
- 体力显示
- 进度条
- 购买按钮
- 广告按钮
- 恢复时间显示

### 使用方法

1. 将 `EnergyUI` 组件添加到场景中的节点
2. 在属性检查器中设置UI元素引用
3. 组件会自动更新显示

## 测试功能

### EnergyExample

提供完整的测试界面，包括：
- 体力消耗测试
- 广告获得体力测试
- 付费购买测试
- 经验值添加测试
- 等级提升测试
- 系统重置测试

### 测试方法

```typescript
// 测试体力系统
energyExample.testEnergySystem();

// 测试等级系统
energyExample.testLevelSystem();

// 测试等级体力联动
energyExample.testLevelEnergyIntegration();
```

## 配置说明

### 等级配置 (level.xlsx)

| 等级 | 经验需求 | 体力上限 | 恢复速度 | 描述 |
|------|----------|----------|----------|------|
| 1 | 0 | 100 | 10 | 1级：体力上限100，每小时恢复10点 |
| 2 | 1000 | 120 | 12 | 2级：体力上限120，每小时恢复12点 |
| 3 | 3000 | 140 | 14 | 3级：体力上限140，每小时恢复14点 |

### 购买配置 (energy_purchase.xlsx)

| ID | 类型 | 体力数量 | 价格 | 描述 |
|----|------|----------|------|------|
| 1 | ad | 20 | 0 | 观看广告获得20体力 |
| 2 | paid | 50 | 1 | 付费1元获得50体力 |
| 3 | paid | 100 | 2 | 付费2元获得100体力 |

## 注意事项

1. **等级变化**: 等级提升时，体力上限会自动更新
2. **体力超出**: 通过广告或购买获得的体力可以超出上限
3. **恢复逻辑**: 特殊情况下只恢复1点达到满体力
4. **持久化**: 等级和体力状态会自动保存到本地存储
5. **回调机制**: 使用回调函数处理状态变化，避免直接访问

## 扩展建议

1. **服务器同步**: 将等级和体力数据同步到服务器
2. **更多配置**: 支持更复杂的等级配置和体力规则
3. **成就系统**: 基于等级和体力使用情况添加成就
4. **社交功能**: 好友间体力赠送功能
5. **活动系统**: 特殊活动期间的体力规则调整 