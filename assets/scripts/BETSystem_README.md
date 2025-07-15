# BET系统 (Bet System)

## 概述

BET系统是一个完整的下注倍率管理系统，支持不同倍率的抓取、体力消耗、等级解锁、奖励计算等功能。

## 系统架构

### 核心组件

1. **BetManager** - BET管理器
   - 管理当前BET状态
   - 处理BET切换逻辑
   - 计算奖励倍数
   - 与体力系统联动

2. **BetUI** - BET UI组件
   - 显示当前BET信息
   - 提供BET切换按钮
   - 显示体力消耗和解锁条件

3. **BetExample** - BET测试组件
   - 提供完整的测试界面
   - 测试BET切换功能
   - 测试奖励计算

## 功能特性

### 4.1 默认BET设置
- 每次重新登陆游戏，默认1BET抓取
- 自动保存和加载BET状态

### 4.2 体力消耗规则
- 1倍抓取消耗1点体力
- 不同BET消耗不同体力
- 体力不足时自动调整到最大可用BET

### 4.3 BET配置
- 可选不同BET：1x/2x/3x/5x/10x/20x/50x
- 不同BET通过BET配置表获得
- 支持等级解锁条件

### 4.4 BET切换
- 切换到当前可选择的最大BET后，再次点击BET按钮，继续循环BET，从1X开始
- 自动跳过不可用的BET

### 4.5 BET结算
- 选择BET后，获得的奖励按BET进行结算
- 特殊物品（大球和巨大球）不参与倍数增加
- 普通物品按BET倍数计算奖励

### 4.6 最大可选BET
- 当前最大可选倍率通过BET配置表获得
- 当体力变少，不足当前BET使用条件，自动下调到最大BET
- 下调后的BET通过BET配置表获得

## 配置说明

### BET配置表 (bet.xlsx)

| BET | 体力消耗 | 解锁等级 | 描述 |
|-----|----------|----------|------|
| 1 | 1 | 1 | 1倍抓取，消耗1点体力 |
| 2 | 2 | 1 | 2倍抓取，消耗2点体力 |
| 3 | 3 | 2 | 3倍抓取，消耗3点体力 |
| 5 | 5 | 3 | 5倍抓取，消耗5点体力 |
| 10 | 10 | 5 | 10倍抓取，消耗10点体力 |
| 20 | 20 | 8 | 20倍抓取，消耗20点体力 |
| 50 | 50 | 10 | 50倍抓取，消耗50点体力 |

## 使用方法

### 基本使用

```typescript
// 获取当前BET
const currentBet = BetManager.instance.getCurrentBet();

// 切换到下一个BET
BetManager.instance.switchToNextBet();

// 设置特定BET
BetManager.instance.setCurrentBet(5);

// 检查BET是否可用
const isAvailable = BetManager.instance.isBetAvailable(10);

// 消耗体力（根据当前BET）
const success = BetManager.instance.consumeEnergy();

// 计算奖励
const reward = BetManager.instance.calculateReward(baseReward, isSpecialItem);
```

### UI组件使用

1. 将 `BetUI` 组件添加到场景中的节点
2. 在属性检查器中设置UI元素引用：
   - `betLabel`: 显示当前BET的Label
   - `betButton`: BET切换按钮
   - `energyCostLabel`: 显示体力消耗的Label
   - `unlockLevelLabel`: 显示解锁等级的Label
   - `betButtonSprite`: 按钮的Sprite组件（用于颜色变化）

3. 组件会自动更新显示

### 测试功能

```typescript
// 测试BET系统
betExample.testBetSystem();

// 测试等级体力联动
betExample.testLevelEnergyIntegration();

// 测试奖励计算
betExample.testRewardCalculation();
```

## 奖励计算规则

### 基础奖励
- SuperMini球: 1点
- Mini球: 2点
- Mid球: 5点
- Big球: 10点（特殊物品）
- SuperBig球: 20点（特殊物品）

### 最终奖励计算
- 普通物品: `基础奖励 × 当前BET`
- 特殊物品: `基础奖励`（不参与倍数）

### 示例
- 当前BET: 5x
- 抓到Mid球: `5 × 5 = 25点`
- 抓到Big球: `10点`（特殊物品不参与倍数）

## 系统联动

### 与体力系统联动
- 体力变化时自动更新可用BET列表
- 体力不足时自动调整到最大可用BET

### 与等级系统联动
- 等级变化时自动更新可用BET列表
- 等级提升时解锁新的BET选项

### 与抓取系统联动
- 抓取时根据当前BET消耗体力
- 抓取完成后根据BET计算奖励

## 注意事项

1. **BET状态持久化**: BET状态会自动保存到localStorage
2. **自动调整**: 当BET不可用时，系统会自动调整到最大可用BET
3. **特殊物品**: 大球和巨大球不参与BET倍数计算
4. **体力检查**: 每次抓取前都会检查体力是否充足
5. **等级限制**: 某些BET需要达到特定等级才能使用

## 扩展功能

### 自定义BET配置
可以通过修改 `BetManager.initBetConfigs()` 方法来添加或修改BET配置：

```typescript
private initBetConfigs(): void {
    this.betConfigs = [
        { bet: 1, energyCost: 1, unlockLevel: 1, description: '1倍抓取，消耗1点体力' },
        { bet: 2, energyCost: 2, unlockLevel: 1, description: '2倍抓取，消耗2点体力' },
        // 添加更多配置...
    ];
}
```

### 自定义奖励计算
可以通过修改 `MainGame.calculateRewards()` 方法来自定义奖励计算逻辑。 