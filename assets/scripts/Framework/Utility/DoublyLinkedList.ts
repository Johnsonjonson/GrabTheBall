/**
 * 
 * @FileName: DoublyLinkedList.ts
 * @ClassName: DoublyLinkedList
 * @Author: yafang
 * @CreateDate: Thu Jun 13 2024 17:01:45 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/DoublyLinkedList.ts
 * @Description: 双向链表
 * 
 */

import LinkedList, { defaultEquals, IEqualsFunction, LinkNode } from "./LinkedList";


export default class DoublyLinkedList<T> extends LinkedList<T> {
    // 多了一个尾部节点tail，重写了head
    protected head?: DoublyNode<T>;
    protected tail?: DoublyNode<T>;
  
    constructor(protected equalsFn: IEqualsFunction<T> = defaultEquals) {
      super(equalsFn);
    }
  
    /**
     * 向双向链表尾部添加一个元素
     * @param {T} element
     */
    public push(element: T) {
      const node = new DoublyNode(element);
  
      if (this.head == null) {
        this.head = node;
        this.tail = node; //   新增
      } else {
        // 添加到尾部，互相交换指针
        this.tail.next = node;
        node.prev = this.tail;
        // 最后把node设为tail
        this.tail = node;
      }
      this.count++;
    }
  
    /**
     * 在指定索引位置处插入元素
     * @param {T} element 待插入的元素
     * @param {number} index 插入位置索引
     * @return {boolean} 返回是否插入成功
     */
    public insert(element: T, index: number): boolean {
      if (index >= 0 && index <= this.count) {
        const node = new DoublyNode(element);
        let current = this.head;
  
        //   插入到第一个
        if (index === 0) {
          // 链表为空
          if (this.head == null) {
            this.head = node;
            this.tail = node;
            // 链表不为空
          } else {
            node.next = this.head;
            this.head.prev = node; // NEW
            this.head = node;
          }
          //   插入到最后一个
        } else if (index === this.count) {
          current = this.tail; // {2}
          current.next = node;
          node.prev = current;
          this.tail = node;
          //   普通情况
        } else {
          const previous = this.getNodeAt(index - 1);
          current = previous.next;
          node.next = current;
          previous.next = node;
  
          current.prev = node; // NEW
          node.prev = previous; // NEW
        }
        this.count++;
        return true;
      }
      return false;
    }
  
    /**
     * 移除指定索引位置处的元素
     * @param {number} index 索引
     * @return {T} 返回移除掉的元素
     */
    public removeAt(index: number): T {
      if (index >= 0 && index < this.count) {
        let current = this.head;
  
        //   删除第一个
        if (index === 0) {
          this.head = this.head.next;
          // 如果只有一个元素，需要同时调整tail
          if (this.count === 1) {
            this.tail = undefined;
          } else {
            this.head.prev = undefined;
          }
          //   删除最后一个
        } else if (index === this.count - 1) {
          current = this.tail;
          this.tail = current.prev;
          this.tail.next = undefined;
          //   普通删除
        } else {
          current = this.getNodeAt(index);
          const previous = current.prev;
          const next = current.next;
          previous.next = next;
          next.prev = previous;
        }
        this.count--;
        return current.element;
      }
      return undefined;
    }
  
    /**
     * 获取链表的最后一个节点
     * @return {Node<T>}
     */
    public getTail(): DoublyNode<T> {
      return this.tail;
    }
  
    /**
     * 清空链表
     */
    public clear() {
      super.clear();
      this.tail = undefined;
    }
  
    /**
     * 从尾向头输出string
     * @return {string}
     */
    public inverseToString() {
      if (this.tail == null) {
        return '';
      }
      let objString = `${this.tail.element}`;
      let previous = this.tail.prev;
      while (previous != null) {
        objString = `${objString},${previous.element}`;
        previous = previous.prev;
      }
      return objString;
    }
}

export class DoublyNode<T> extends LinkNode<T> {
    constructor(
      public element: T,
      public next?: DoublyNode<T>,
      public prev?: DoublyNode<T>
    ) {
      super(element, next);
    }
  }
