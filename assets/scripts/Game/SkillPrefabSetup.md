# 横版技能预制体设置说明

## 预制体结构

### 1. 技能根节点 (SkillRoot)
```
SkillRoot (Node)
├── SkillIcon (Sprite) - 技能图标
├── SkillName (Label) - 技能名称
├── TriggerCount (Label) - 触发次数显示
└── EffectNode (Node) - 效果节点
    ├── EffectSprite (Sprite) - 效果精灵
    └── EffectLabel (Label) - 效果数值
```

### 2. 组件配置

#### SkillRoot 节点
- 添加 `HorizontalSkillUI` 组件
- 设置节点大小为 100x50 像素
- 添加 `Sprite` 组件作为背景

#### SkillIcon 节点
- 设置大小为 40x40 像素
- 位置居中
- 添加技能图标资源

#### SkillName 节点
- 设置大小为 80x20 像素
- 位置在图标下方
- 字体大小 12，居中对齐

#### TriggerCount 节点
- 设置大小为 60x15 像素
- 位置在右上角
- 字体大小 10，右对齐

#### EffectNode 节点
- 默认隐藏
- 设置大小为 100x50 像素
- 位置覆盖整个技能区域

## 设置步骤

### 1. 创建预制体
1. 在场景中创建上述节点结构
2. 设置各节点的属性和组件
3. 将根节点拖拽到资源面板创建预制体

### 2. 配置组件引用
1. 选择 SkillRoot 节点
2. 在 `HorizontalSkillUI` 组件中设置引用：
   - Skill Icon: 拖拽 SkillIcon 节点
   - Skill Name: 拖拽 SkillName 节点
   - Trigger Count: 拖拽 TriggerCount 节点
   - Effect Node: 拖拽 EffectNode 节点
   - Effect Sprite: 拖拽 EffectSprite 节点
   - Effect Label: 拖拽 EffectLabel 节点

### 3. 设置技能管理器
1. 在场景中创建技能管理器节点
2. 添加 `HorizontalSkillManager` 组件
3. 设置组件引用：
   - Skill Prefab: 拖拽技能预制体
   - Skill Container: 拖拽技能容器节点
   - Screen Boundary: 拖拽屏幕边界节点

### 4. 配置主游戏
1. 在 `MainGame` 组件中设置：
   - Skill Manager Node: 拖拽技能管理器节点

## 资源要求

### 技能图标
- 建议尺寸: 40x40 像素
- 格式: PNG
- 背景: 透明

### 效果图标
- 建议尺寸: 100x50 像素
- 格式: PNG
- 背景: 透明或半透明

### 字体设置
- 技能名称: 12号字体，白色
- 触发次数: 10号字体，黄色
- 效果数值: 14号字体，金色

## 动画配置

### 生成动画
- 时长: 1秒
- 效果: 从0缩放到1
- 缓动: 缓出

### 触发效果
- 时长: 0.5秒
- 效果: 高亮闪烁 + 缩放
- 缓动: 缓入缓出

### 消失动画
- 时长: 0.5秒
- 效果: 缩放到0 + 透明度渐变
- 缓动: 缓入

## 注意事项

1. **性能优化**: 预制体节点数量要控制在合理范围内
2. **内存管理**: 技能节点会自动销毁，注意资源释放
3. **适配性**: 预制体大小要考虑不同屏幕尺寸
4. **可扩展性**: 预留足够的空间用于添加新功能

## 调试建议

1. **可视化调试**: 在场景中显示技能区域边界
2. **日志输出**: 添加详细的技能状态日志
3. **性能监控**: 监控技能生成和销毁的性能影响
4. **错误处理**: 添加预制体加载失败的处理逻辑 