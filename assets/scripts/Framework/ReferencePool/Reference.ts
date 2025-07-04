/**
 * 
 * @FileName: Reference.ts
 * @ClassName: Reference
 * @Author: yafang
 * @CreateDate: Tue Mar 25 2025 15:21:25 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/ReferencePool/Reference.ts
 * @Description: 引用对象基类
 * 
 */

import { MathUtility } from "../Utility/MathUtility";

export abstract class Reference {

    private static _referenceID: number = -1007;

    static get ReferenceID() : number {
        if(this._referenceID == -1007) {
            this._referenceID = MathUtility.newIdentifier();
        }

        return this._referenceID;
    }

    /**
     * 返回引用对象的唯一标识�?
     */
    abstract getReferenceID(): number;
    // abstract getTypeID(): number;

    /**
     * 清理引用对象�?
     */
    abstract clear(): void;
}

