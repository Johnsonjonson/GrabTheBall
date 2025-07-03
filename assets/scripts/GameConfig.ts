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

@ccclass('GameConfig')
export class GameConfig {

    
   public static BallGenConfig = [
    {
        type: BallType.SuperMini,
        rate:80,
        size:10,
    },
    {
        type: BallType.Mini,
        rate:18,
        size:15,
    },
    {
        type: BallType.Mid,
        rate:1.8,
        size:30,
    },
    {
        type: BallType.Big,
        rate:0.18,
        size:100,
    },
    {
        type: BallType.SuperBig,
        rate:0.02,
        size:150,
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
   ]
    
}