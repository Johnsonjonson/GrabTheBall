# 横版技能系统说明文档

## 概述

横版技能系统是抓球游戏中的一个重要功能，通过抓取"？"彩球触发，为游戏增加策略性和趣味性。

## 系统架构

### 核心组件

1. **GameConfig.ts** - 配置表
   - 技能类型定义
   - 技能配置数据
   - 高度档位配置

2. **HorizontalSkillManager.ts** - 技能管理器
   - 技能生成逻辑
   - 技能触发检测
   - 技能状态管理

3. **HorizontalSkillUI.ts** - 技能UI组件
   - 技能图标显示
   - 触发效果动画
   - 技能状态更新

4. **MainGame.ts** - 主游戏集成
   - 技能系统初始化
   - 技能效果处理
   - 与爪子系统集成

## 功能特性

### 1. 技能产出机制

- **触发条件**: 通过抓取"？"彩球触发
- **触发概率**: 通过配置表控制（默认15%）
- **生成位置**: 低、中、高三个高度档位
- **生成动画**: 1秒内的缩放动画
- **滑动效果**: 自动左右滑动，速度可配置

### 2. 技能限制规则

- **高度限制**: 每个高度档位只能生成一个技能
- **数量限制**: 最多同时存在3个技能
- **高度选择**: 如果某个高度已有技能，随机选择其他可用高度
- **技能类型**: 根据高度限制随机选择可用技能类型

### 3. 技能触发机制

- **触发区域**: 只有爪子的技能触发区域触碰才生效
- **连续触发**: 可以同时触发多个技能
- **触发效果**: 技能停止滑动并高亮显示
- **触发次数**: 每个技能有最大触发次数限制

### 4. 技能类型

#### 形态变更类型 (Morph)
- **双倍爪子**: 爪子变成双倍大小
- **磁力爪子**: 爪子具有磁力，吸引更多球
- **超级爪子**: 爪子变成超级形态，抓取所有球

#### 结算类型 (Settlement)
- **金币加成**: 本回合金币获得翻倍
- **经验加成**: 本回合经验获得1.5倍

## 配置说明

### 技能配置 (HorizontalSkillConfig)

```typescript
{
    id: 1,                    // 技能ID
    name: "双倍爪子",         // 技能名称
    type: HorizontalSkillType.Morph,  // 技能类型
    triggerRate: 5,           // 触发概率(%)
    allowedHeights: [1,2,3],  // 允许出现的高度
    slideSpeed: 100,          // 滑动速度(像素/秒)
    maxTriggers: 3,           // 最大触发次数
    duration: 1.0,            // 生成动画时长(秒)
    effectDuration: 0.5,      // 效果动画时长(秒)
    bonusValue: 2.0,          // 加成倍数(结算类型)
    description: "爪子变成双倍大小"
}
```

### 高度配置 (SkillHeightConfig)

```typescript
{
    height: SkillHeight.Low,  // 高度档位
    yPosition: -200,          // Y轴位置
    name: "低"                // 高度名称
}
```

## 使用方法

### 1. 场景设置

1. 在场景中创建技能管理器节点
2. 添加 `HorizontalSkillManager` 组件
3. 设置技能预制体和容器节点
4. 在 `MainGame` 中设置 `skillManagerNode` 引用

### 2. 初始化

```typescript
// 在MainGame.ts中
private initHorizontalSkillSystem(): void {
    const skillManager = this.skillManagerNode.getComponent(HorizontalSkillManager);
    skillManager.setSkillTriggerCallback(this.onSkillTriggered.bind(this));
}
```

### 3. 技能触发检测

```typescript
// 在Claws.ts中
private checkSkillTrigger(): void {
    const clawPosition = this.node.getPosition();
    const clawSize = this.clawsArea.getComponent(UITransform).contentSize;
    HorizontalSkillManager.instance.checkSkillTrigger(clawPosition, clawSize);
}
```

### 4. 技能效果处理

```typescript
private onSkillTriggered: SkillTriggerCallback = (skillId, skillType, bonusValue) => {
    if (skillType === HorizontalSkillType.Morph) {
        this.handleMorphSkill(skillId);
    } else if (skillType === HorizontalSkillType.Settlement) {
        this.handleSettlementSkill(skillId, bonusValue);
    }
};
```

## 测试和调试

### 使用HorizontalSkillExample

1. 创建测试场景
2. 添加 `HorizontalSkillExample` 组件
3. 设置相关UI引用
4. 使用测试按钮验证功能

### 测试功能

- **生成技能**: 测试技能生成逻辑
- **重置技能**: 清除所有技能
- **触发检测**: 模拟爪子触发技能
- **系统测试**: 完整功能测试
- **配置测试**: 验证配置数据

## 扩展说明

### 添加新技能

1. 在 `GameConfig.HorizontalSkillConfig` 中添加新技能配置
2. 在 `MainGame.ts` 的 `handleMorphSkill` 或 `handleSettlementSkill` 中添加处理逻辑
3. 实现具体的技能效果

### 修改技能效果

1. 在对应的 `applyXXXEffect` 方法中实现具体逻辑
2. 可以修改爪子的属性、碰撞检测、视觉效果等
3. 对于结算类型，可以在奖励计算时应用倍数

### 自定义配置

1. 修改 `GameConfig.ts` 中的配置数据
2. 调整触发概率、滑动速度、动画时长等参数
3. 可以添加新的高度档位或技能类型

## 注意事项

1. **性能优化**: 技能检测在爪子移动时进行，注意性能影响
2. **内存管理**: 技能节点在触发完成后会自动销毁
3. **状态保存**: 支持离线保存和恢复技能状态
4. **错误处理**: 添加了完善的错误检查和日志记录

## 常见问题

### Q: 技能不生成怎么办？
A: 检查触发概率配置、技能数量限制、高度档位可用性

### Q: 技能不触发怎么办？
A: 检查爪子碰撞检测、技能触发区域设置

### Q: 如何调整技能平衡性？
A: 修改配置表中的触发概率、最大触发次数、加成倍数等参数

### Q: 如何添加新的技能类型？
A: 在枚举中添加新类型，在配置中添加对应技能，在处理方法中添加逻辑 