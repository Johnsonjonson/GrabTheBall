/**
 * 
 * @FileName: ReferencePool.ts
 * @ClassName: ReferencePool
 * @Author: yafang
 * @CreateDate: Tue Mar 25 2025 10:23:57 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/ReferencePool/ReferencePool.ts
 * @Description: 
 * 
 */

import { Reference } from "./Reference";
import { ReferenceCollection } from "./ReferenceCollection";
import { ReferencePoolInfo } from "./ReferencePoolInfo";

/**
 * 引用池类。
 */
export class ReferencePool {

    private static _referenceCollections: Map<number, ReferenceCollection> = new Map();

    /**
     * 获取引用池的数量。
     */
    static get count(): number {
        return this._referenceCollections.size;
    }

    /**
     * 获取所有引用池的信息。
     * @returns 所有引用池的信息数组。
     */
    static getAllReferencePoolInfos(): ReferencePoolInfo[] {
        const results: ReferencePoolInfo[] = [];
        for (const [referenceType, referenceCollection] of this._referenceCollections) {
            results.push(
                new ReferencePoolInfo(
                    referenceType,
                    referenceCollection.unusedReferenceCount,
                    referenceCollection.usingReferenceCount,
                    referenceCollection.acquireReferenceCount,
                    referenceCollection.releaseReferenceCount,
                    referenceCollection.addReferenceCount,
                    referenceCollection.removeReferenceCount
                )
            );
        }
        return results;
    }

    /**
     * 清除所有引用池。
     */
    static clearAll(): void {
        for (const referenceCollection of this._referenceCollections.values()) {
            referenceCollection.removeAll();
        }
        this._referenceCollections.clear();
    }

    /**
     * 从引用池获取引用。
     * @param referenceType 类型
     * @param ctor 类
     * @returns 
     */
    static acquire<T extends Reference>(referenceType: number, ctor: () => T): T {
        return this.getReferenceCollection(referenceType).acquire<T>(referenceType, ctor);
    }

    /**
     * 将引用归还引用池。
     * @param reference 要归还的引用。
     */
    static release<T extends Reference>(reference: T): void {
        if (!reference) {
            throw new Error('Reference is invalid.');
        }
    
        this.getReferenceCollection(reference.getReferenceID()).release(reference);
    }

    /**
     * 从引用池中移除指定数量的引用。
     * @param count 移除的数量。
     */
    static remove(referenceType: number, count: number): void {
        this.getReferenceCollection(referenceType).remove(count);
    }

    /**
     * 从引用池中移除所有的引用。
     */
    static removeAll(referenceType: number): void {
        this.getReferenceCollection(referenceType).removeAll();
    }

    private static getReferenceCollection(referenceType: number): ReferenceCollection {
        let referenceCollection = this._referenceCollections.get(referenceType);
        if (!referenceCollection) {
            referenceCollection = new ReferenceCollection(referenceType);
            this._referenceCollections.set(referenceType, referenceCollection);
        }
        return referenceCollection;
    }
}
