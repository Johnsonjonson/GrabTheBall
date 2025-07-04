/**
 * 
 * @FileName: ReferencePoolInfo.ts
 * @ClassName: ReferencePoolInfo
 * @Author: yafang
 * @CreateDate: Tue Mar 25 2025 10:24:29 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/ReferencePool/ReferencePoolInfo.ts
 * @Description: 
 * 
 */

export class ReferencePoolInfo {
     /**
     * 引用池类型。
     */
     private _typeID: number;
     /**
      * 未使用引用数量。
      */
     private _unusedReferenceCount: number;
     /**
      * 正在使用引用数量。
      */
     private _usingReferenceCount: number;
     /**
      * 获取引用数量。
      */
     private _acquireReferenceCount: number;
     /**
      * 归还引用数量。
      */
     private _releaseReferenceCount: number;
     /**
      * 增加引用数量。
      */
     private _addReferenceCount: number;
     /**
      * 移除引用数量。
      */
     private _removeReferenceCount: number;
 
     /**
      * 初始化引用池信息的新实例。
      * @param _typeID 引用池类型。
      * @param unusedReferenceCount 未使用引用数量。
      * @param usingReferenceCount 正在使用引用数量。
      * @param acquireReferenceCount 获取引用数量。
      * @param releaseReferenceCount 归还引用数量。
      * @param addReferenceCount 增加引用数量。
      * @param removeReferenceCount 移除引用数量。
      */
     constructor(
        typeID: number,
         unusedReferenceCount: number,
         usingReferenceCount: number,
         acquireReferenceCount: number,
         releaseReferenceCount: number,
         addReferenceCount: number,
         removeReferenceCount: number
     ) {
         this._typeID = typeID;
         this._unusedReferenceCount = unusedReferenceCount;
         this._usingReferenceCount = usingReferenceCount;
         this._acquireReferenceCount = acquireReferenceCount;
         this._releaseReferenceCount = releaseReferenceCount;
         this._addReferenceCount = addReferenceCount;
         this._removeReferenceCount = removeReferenceCount;
     }
 
     /**
      * 获取引用池类型。
      */
     get type(): number {
         return this._typeID;
     }
 
     /**
      * 获取未使用引用数量。
      */
     get unusedReferenceCount(): number {
         return this._unusedReferenceCount;
     }
 
     /**
      * 获取正在使用引用数量。
      */
     get usingReferenceCount(): number {
         return this._usingReferenceCount;
     }
 
     /**
      * 获取获取引用数量。
      */
     get acquireReferenceCount(): number {
         return this._acquireReferenceCount;
     }
 
     /**
      * 获取归还引用数量。
      */
     get releaseReferenceCount(): number {
         return this._releaseReferenceCount;
     }
 
     /**
      * 获取增加引用数量。
      */
     get addReferenceCount(): number {
         return this._addReferenceCount;
     }
 
     /**
      * 获取移除引用数量。
      */
     get removeReferenceCount(): number {
         return this._removeReferenceCount;
     } 
}
