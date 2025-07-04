/**
 * 
 * @FileName: MathUtility.ts
 * @ClassName: MathUtility
 * @Author: yafang
 * @CreateDate: Fri May 17 2024 17:56:26 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/MathUtility.ts
 * @Description: 
 *      数学工具类
 */

import { sys, Quat, Vec3 } from "cc";

export class MathUtility {
    private static identifier = 10000;
    //物品实例id
    private static _startInstanceId: number = 1;

    public static newIdentifier(): number {
        MathUtility.identifier++;
        return MathUtility.identifier;
    }

    /**
     * 
     * 生成随机整数
     * @param min 最小值
     * @param max  最大值
     * @returns 
     */
    public static randomInt(min: number, max: number): number {
        let range = max - min;
        let rand = Math.random();
        return min + Math.round(rand * range);
    }

    /**
     * 获取范围之间的随机数 [min,max）
     */
    public static randomNum(min: number, max: number): number {
        let range = max - min;
        let rand = Math.random();
        return min + rand * range;
    }


    public static generateInstanceId() {
        let ret = sys.now() * 100 + this._startInstanceId
        if (this._startInstanceId >= 100) {
            this._startInstanceId = 1
        }
        this._startInstanceId = this._startInstanceId + 1
        return ret;
    }

    /**
     * 绕z轴旋转，返回旋转四元数
     */
    public static getQuat(rotateZ: number) {
        // 将欧拉角转换为四元数
        let rotationQuat = new Quat();
        Quat.fromEuler(rotationQuat, 0, 0, rotateZ);
        return rotationQuat;
    }


    /** 获得两点的角度（弧度值） */
    public static getAngle(x1, y1, x2, y2) {
        let lx = x2 - x1, ly = y2 - y1;
        return Math.atan2(ly, lx);
    }

}
