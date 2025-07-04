/**
 * 
 * @FileName: ReferenceCollection.ts
 * @ClassName: ReferenceCollection
 * @Author: yafang
 * @CreateDate: Tue Mar 25 2025 10:24:13 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/ReferencePool/ReferenceCollection.ts
 * @Description: 
 * 
 */

import { Queue } from "../Utility/Queue";
import { Reference } from "./Reference";

export class ReferenceCollection {
    private readonly _references: Queue<Reference>;
    private readonly _referenceType: number;
    private _usingReferenceCount: number;
    private _acquireReferenceCount: number;
    private _releaseReferenceCount: number;
    private _addReferenceCount: number;
    private _removeReferenceCount: number;

    /**
     * 构造函数，初始化引用集合。
     * @param referenceType 引用类型。
     */
    constructor(referenceType: number) {
        this._references = new Queue<Reference>();
        this._referenceType = referenceType;
        this._usingReferenceCount = 0;
        this._acquireReferenceCount = 0;
        this._releaseReferenceCount = 0;
        this._addReferenceCount = 0;
        this._removeReferenceCount = 0;
    }

    /**
     * 获取引用类型。
     */
    get referenceType(): number {
        return this._referenceType;
    }

    /**
     * 获取未使用的引用数量。
     */
    get unusedReferenceCount(): number {
        return this._references.size();
    }

    /**
     * 获取正在使用的引用数量。
     */
    get usingReferenceCount(): number {
        return this._usingReferenceCount;
    }

    /**
     * 获取获取引用的总次数。
     */
    get acquireReferenceCount(): number {
        return this._acquireReferenceCount;
    }

    /**
     * 获取释放引用的总次数。
     */
    get releaseReferenceCount(): number {
        return this._releaseReferenceCount;
    }

    /**
     * 获取添加引用的总次数。
     */
    get addReferenceCount(): number {
        return this._addReferenceCount;
    }

    /**
     * 获取移除引用的总次数。
     */
    get removeReferenceCount(): number {
        return this._removeReferenceCount;
    }

    /**
     * 获取指定类型的引用。
     * @returns 获取到的引用。
     */
    acquire<T extends Reference>(referenceType: number, ctor: () => T): T {
        if (referenceType !== this.referenceType) {
            throw new Error('Type is invalid.');
        }

        this._usingReferenceCount++;
        this._acquireReferenceCount++;
        if (this._references.size() > 0) {
            return this._references.dequeue() as T;
        }

        this._addReferenceCount++;

        return ctor();
    }

    /**
     * 释放引用。
     * @param reference 要释放的引用。
     */
    release(reference: Reference): void {
        reference.clear();
        if (this._references.contains(reference)) {
            throw new Error('The reference has been released.');
        }

        this._references.enqueue(reference);
        this._releaseReferenceCount++;
        this._usingReferenceCount--;
    }

    /**
     * 移除指定数量的引用。
     * @param count 要移除的引用数量。
     */
    remove(count: number): void {
        if (count > this._references.size()) {
            count = this._references.size();
        }

        this._removeReferenceCount += count;
        while (count-- > 0) {
            this._references.dequeue();
        }
    }

    /**
     * 移除所有引用。
     */
    removeAll(): void {
        this._removeReferenceCount += this._references.size();
        this._references.clear();
    }
}
