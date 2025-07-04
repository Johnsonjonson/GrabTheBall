/**
 * @FileName: SingletonDecorator.ts
 * @Author: ReneYang
 * @Date: 2025-04-10 09:42:00
 * @Description: 单例装饰器
 * 用法： class上添加@SingletonDecorator 修饰即可，引用单例时直接new className()
 */

export function SingletonDecorator<T extends new (...args: any[]) => any>(target: T) {
    let instance: InstanceType<T>;
    return class extends target {
      constructor(...args: any[]) {
        if (instance) return instance as T;
        super(...args);
        instance = this as InstanceType<T>;
      }
    } as T;  // 强制断言返回类型与原类一致
  }