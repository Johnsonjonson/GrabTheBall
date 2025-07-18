/**
 * 
 * @FileName: LinkedList.ts
 * @ClassName: LinkedList
 * @Author: yafang
 * @CreateDate: Thu Jun 13 2024 16:57:08 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/LinkedList.ts
 * @Description: 链表数据结构
 * 
 */


export default class LinkedList<T> {
    protected count = 0;
    protected head?: LinkNode<T>;
  
    constructor(protected equalsFn: IEqualsFunction<T> = defaultEquals) {

    }

    /**
     * @description: 向链表尾部添加一个元素
     * @param {T} element
     */
    public push(element: T) {
      const node = new LinkNode(element);
      let current;
  
      if (this.head == null) {
        // 第一个元素时直接添加
        this.head = node;
      } else {
        // 找到最后一个元素，在它之后添加
        current = this.getNodeAt(this.size() - 1);
        current.next = node;
      }
  
      // 最后把计数+1
      this.count++;
    }
    /**
     * @description: 获取指定索引处的节点
     * @param {number} index 索引
     * @return {Node<T>} 返回指定索引处的node
     */
    public getNodeAt(index: number): LinkNode<T> {
      if (index >= 0 && index <= this.count) {
        let node = this.head;
        // 在第几位上就迭代多少次
        for (let i = 0; i < index && node != null; i++) {
          node = node.next;
        }
        return node;
      }
      return undefined;
    }
  
    /**
     * @description: 获取指定索引处的元素
     * @param {number} index 索引
     * @return {T} 返回指定索引处的元素
     */
    public getElementAt(index: number): T {
      return this.getNodeAt(index)?.element;
    }
  
    /**
     * @description: 在指定索引位置处插入元素
     * @param {T} element 待插入的元素
     * @param {number} index 插入位置索引
     * @return {boolean} 返回是否插入成功
     */
    public insert(element: T, index: number) {
      if (index >= 0 && index <= this.count) {
        const node = new LinkNode(element);
  
        // 插入元素同样分“第一个”和“非第一个”两种情况
        if (index === 0) {
          const current = this.head;
          node.next = current;
          this.head = node;
        } else {
          // 解开该位置的next链接，插入新的节点
          const previous = this.getNodeAt(index - 1);
          node.next = previous.next;
          previous.next = node;
        }
        // 最后给count++并返回true
        this.count++;
        return true;
      }
      return false;
    }
  
    /**
     * @description: 移除指定索引位置处的元素
     * @param {number} index 索引
     * @return {T} 返回移除掉的元素
     */
    public removeAt(index: number) {
      if (index >= 0 && index < this.count) {
        let current = this.head;
  
        // 插移除元素同样分“第一个”和“非第一个”两种情况
        if (index === 0) {
          this.head = current.next;
        } else {
          const previous = this.getNodeAt(index - 1);
          current = previous.next;
          previous.next = current.next;
        }
        // 把计数减一
        this.count--;
        return current.element;
      }
      return undefined;
    }
  
    /**
     * @description: 移除指定元素
     * @param {T} element 待移除的元素
     * @return {T} element 返回移除的元素
     */
    public remove(element: T): T {
      // 调用了removeAt
      const index = this.indexOf(element);
      return this.removeAt(index);
    }
  
    /**
     * @description: 返回指定元素的索引（只返回从前面数第一个相等的）
     * @param {T} element 元素
     * @return {number} index 索引
     */
    public indexOf(element: T): number {
      let current = this.head;
  
      // 迭代着寻找相等的元素
      for (let i = 0; i < this.size() && current != null; i++) {
        // 用到了判断相等的方法
        if (this.equalsFn(element, current.element)) {
          return i;
        }
        current = current.next;
      }
  
      return -1;
    }
  
    /**
     * @description: 返回链表是否为空
     * @return {boolean}
     */
    public isEmpty(): boolean {
      return this.size() === 0;
    }
  
    /**
     * @description: 返回链表的元素数目
     * @return {number}
     */
    public size(): number {
      return this.count;
    }
  
    /**
     * @description: 获取链表的第一个节点
     * @return {Node<T>}
     */
    public getHead(): LinkNode<T> {
      return this.head;
    }
  
    /**
     * @description: 清空链表
     */
    public clear() {
      this.head = undefined;
      this.count = 0;
    }
  
    /**
     * @description: 替代默认toString
     * @return {string}
     */
    public toString(): string {
      if (this.head == null) {
        return '';
      }
      let objString = `${this.head.element}`;
      let current = this.head.next;
      for (let i = 1; i < this.size() && current != null; i++) {
        objString = `${objString},${current.element}`;
        current = current.next;
      }
      return objString;
    }
}

// 规定了自定义相等比较函数的类型
export type IEqualsFunction<T> = (a: T, b: T) => boolean;

/**
 * @description: 默认的相等比较函数，三等比较
 * @param {T} a
 * @param {T} b
 * @return {boolean} 返回a、b是否相等
 */
export function defaultEquals<T>(a: T, b: T): boolean {
  return a === b;
}

export class LinkNode<T> {
  constructor(public element: T, public next?: LinkNode<T>) {}
}

