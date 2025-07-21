# 横版技能系统更新说明

## 更新内容

### 1. 左右来回移动
- **原功能**: 技能从左侧移动到右侧后消失
- **新功能**: 技能在屏幕左右边界之间来回移动，永不消失（除非触发次数用完）

### 2. 动态速度变化
- **原功能**: 技能以固定速度移动
- **新功能**: 技能速度根据位置动态变化
  - 越靠近屏幕中心，移动越慢（0.3倍基础速度）
  - 越靠近屏幕边缘，移动越快（1.0倍基础速度）
  - 速度变化公式：`speedMultiplier = 0.3 + 0.7 * (distanceFromCenter / maxDistance)`

### 3. 触发次数管理
- **原功能**: 技能触发后立即消失
- **新功能**: 技能有最大触发次数限制，只有用完所有次数才会消失
  - 每次触发后，技能继续移动
  - 触发次数显示格式：`当前次数/最大次数`
  - 达到最大次数后播放消失动画

## 技术实现

### 新增属性
在 `HorizontalSkillInstance` 接口中添加：
```typescript
isMovingRight: boolean; // 移动方向标识
baseSpeed: number;      // 基础速度
```

### 核心方法修改

#### 1. startSliding() 方法
```typescript
// 确定移动方向和目标位置
let targetX: number;
if (skillInstance.isMovingRight) {
    targetX = this.screenRightBound + 50;
} else {
    targetX = this.screenLeftBound - 50;
}

// 计算速度倍数
const screenCenter = (this.screenLeftBound + this.screenRightBound) / 2;
const distanceFromCenter = Math.abs(currentPos.x - screenCenter);
const maxDistance = (this.screenRightBound - this.screenLeftBound) / 2;
const speedMultiplier = 0.3 + 0.7 * (distanceFromCenter / maxDistance);

// 到达边界后改变方向
.call(() => {
    skillInstance.isMovingRight = !skillInstance.isMovingRight;
    this.startSliding(skillInstance);
})
```

#### 2. triggerSkill() 方法
```typescript
// 更新UI显示
const skillUI = skillInstance.node.getComponent(HorizontalSkillUI);
if (skillUI) {
    skillUI.addTriggerCount();
}

// 检查是否达到最大触发次数
if (skillInstance.triggerCount >= skillInstance.maxTriggers) {
    // 触发次数用完，播放消失动画并移除技能
    this.playDisappearAnimation(skillInstance);
} else {
    // 触发次数未用完，继续滑动
    this.startSliding(skillInstance);
}
```

### UI更新
- 在技能触发时自动更新触发次数显示
- 支持状态保存和恢复
- 新增测试脚本 `HorizontalSkillTest.ts` 用于验证功能

## 配置说明

### 技能配置
在 `GameConfig.ts` 中的技能配置保持不变：
```typescript
{
    id: 1,
    name: "双倍爪子",
    type: HorizontalSkillType.Morph,
    slideSpeed: 100,        // 基础速度
    maxTriggers: 3,         // 最大触发次数
    // ... 其他配置
}
```

### 速度参数
- **基础速度**: 通过 `slideSpeed` 配置
- **中心速度**: 基础速度的 0.3 倍
- **边缘速度**: 基础速度的 1.0 倍
- **过渡**: 线性插值，根据距离屏幕中心的远近计算

## 使用说明

### 1. 生成技能
```typescript
// 尝试生成技能（15%概率）
HorizontalSkillManager.instance.tryGenerateSkill();

// 强制生成技能（100%概率，用于测试）
HorizontalSkillManager.instance.tryGenerateSkill(100);
```

### 2. 检查技能状态
```typescript
// 获取当前技能数量
const count = HorizontalSkillManager.instance.getActiveSkillCount();

// 获取指定高度的技能
const skill = HorizontalSkillManager.instance.getSkillAtHeight(SkillHeight.Mid);
if (skill) {
    console.log(`技能: ${skill.skillConfig.name}`);
    console.log(`触发次数: ${skill.triggerCount}/${skill.maxTriggers}`);
    console.log(`移动方向: ${skill.isMovingRight ? '向右' : '向左'}`);
}
```

### 3. 状态保存和恢复
```typescript
// 保存状态
const state = HorizontalSkillManager.instance.saveSkillState();

// 恢复状态
HorizontalSkillManager.instance.loadSkillState(state);
```

## 测试

使用 `HorizontalSkillTest` 组件进行功能测试：
1. 将组件添加到场景中的节点
2. 设置按钮和标签引用
3. 点击"生成技能"按钮测试技能生成
4. 点击"测试功能"按钮查看详细信息

## 注意事项

1. **性能优化**: 技能会一直移动，注意控制同时存在的技能数量
2. **边界处理**: 技能在屏幕边界外50像素处改变方向，避免视觉跳跃
3. **状态同步**: 确保UI组件正确更新触发次数显示
4. **内存管理**: 技能消失时正确清理资源和动画

## 兼容性

- 保持与现有代码的完全兼容
- 现有技能配置无需修改
- 新增功能为可选特性，不影响原有逻辑 