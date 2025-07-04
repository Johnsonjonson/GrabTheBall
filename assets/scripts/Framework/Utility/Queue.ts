/**
 * 
 * @FileName: Queue.ts
 * @ClassName: Queue
 * @Author: yafang
 * @CreateDate: Mon Mar 17 2025 19:55:19 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/Queue.ts
 * @Description: 实现一个简单的队列类
 * 
 */

export class Queue<T> {
    private items: T[] = [];

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    size(): number {
        return this.items.length;
    }

    contains(item: T): boolean {
        return this.items.includes(item);
    }

    clear(): void {
        this.items = [];
    }
}
