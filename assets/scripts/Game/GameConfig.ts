import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;


export enum BallType {
    SuperMini = 1,
    Mini = 2,
    Mid = 3,
    Big = 4,
    SuperBig = 5,
}

export enum BallColor {
    Red = 1,
    Orange = 2,
    Yellow = 3,
    Green = 4,
    Blue = 5,
    White = 6,
    Black = 7,
}

// 横版技能类型
export enum HorizontalSkillType {
    Morph = 1,      // 形态变更类型
    Settlement = 2, // 结算类型
}

// 横版技能高度档位
export enum SkillHeight {
    Low = 1,    // 低
    Mid = 2,    // 中
    High = 3,   // 高
}

@ccclass('GameConfig')
export class GameConfig {

    
   public static BallGenConfig = [
    {
        type: BallType.SuperMini,
        rate:80, // 80%
        size:50, 
    },
    {
        type: BallType.Mini,
        rate:18, // 18%
        size:70,
    },
    {
        type: BallType.Mid,
        rate:1.8, // 1.8%
        size:100,
    },
    {
        type: BallType.Big,
        rate:0.18, // 0.18%
        size:180,
    },
    {
        type: BallType.SuperBig,
        rate:0.02,
        size:230,
    },
   ];
   public static BallColorConfig = [
    {
        color: BallColor.Red,
        rate:15,
    },
    {
        color: BallColor.Orange,
        rate:15,
    },
    {
        color: BallColor.Yellow,
        rate:15,
    },
    {
        color: BallColor.Green,
        rate:15,
    },
    {
        color: BallColor.Blue,
        rate:15,
    },
    {
        color: BallColor.White,
        rate:12.5,
    },
    {
        color: BallColor.Black,
        rate:12.5,
    },
   ];

   // 横版技能配置
   public static HorizontalSkillConfig = [
    {
        id: 1,
        name: "双倍爪子",
        type: HorizontalSkillType.Morph,
        triggerRate: 5, // 5%触发概率
        allowedHeights: [SkillHeight.Low, SkillHeight.Mid, SkillHeight.High], // 允许出现的高度
        slideSpeed: 100, // 滑动速度(像素/秒)
        maxTriggers: 3, // 最大触发次数
        duration: 1.0, // 生成动画时长(秒)
        effectDuration: 0.5, // 效果动画时长(秒)
        description: "爪子变成双倍大小"
    },
    {
        id: 2,
        name: "磁力爪子",
        type: HorizontalSkillType.Morph,
        triggerRate: 3, // 3%触发概率
        allowedHeights: [SkillHeight.Mid, SkillHeight.High],
        slideSpeed: 80,
        maxTriggers: 2,
        duration: 1.0,
        effectDuration: 0.5,
        description: "爪子具有磁力，可以吸引更多球"
    },
    {
        id: 3,
        name: "金币加成",
        type: HorizontalSkillType.Settlement,
        triggerRate: 8, // 8%触发概率
        allowedHeights: [SkillHeight.Low, SkillHeight.Mid],
        slideSpeed: 120,
        maxTriggers: 1,
        duration: 1.0,
        effectDuration: 0.5,
        bonusValue: 2.0, // 金币倍数
        description: "本回合金币获得翻倍"
    },
    {
        id: 4,
        name: "经验加成",
        type: HorizontalSkillType.Settlement,
        triggerRate: 6, // 6%触发概率
        allowedHeights: [SkillHeight.Mid, SkillHeight.High],
        slideSpeed: 90,
        maxTriggers: 1,
        duration: 1.0,
        effectDuration: 0.5,
        bonusValue: 1.5, // 经验倍数
        description: "本回合经验获得1.5倍"
    },
    {
        id: 5,
        name: "超级爪子",
        type: HorizontalSkillType.Morph,
        triggerRate: 1, // 1%触发概率
        allowedHeights: [SkillHeight.High],
        slideSpeed: 60,
        maxTriggers: 1,
        duration: 1.0,
        effectDuration: 0.5,
        description: "爪子变成超级形态，可以抓取所有球"
    }
   ];

   // 横版技能高度配置
   public static SkillHeightConfig = [
    {
        height: SkillHeight.Low,
        yPosition: -200, // Y轴位置
        name: "低"
    },
    {
        height: SkillHeight.Mid,
        yPosition: 0,
        name: "中"
    },
    {
        height: SkillHeight.High,
        yPosition: 200,
        name: "高"
    }
   ];

   // 问号球触发横版技能的概率
   public static QuestionBallSkillTriggerRate = 15; // 15%
    static SkillHeight: any;
    
}