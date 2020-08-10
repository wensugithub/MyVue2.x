
/**
 * 观察者 观察,监听
 */
class Watcher {
  constructor(vm, attrValue, callback) {
    this.vm = vm;
    this.attrValue = attrValue;
    this.callback = callback;
    // 先将旧值保存起来
    this.oldValue = this.getOldVal();
  }
  getOldVal() {
    // 给Dep设置一个target属性，指向Watcher
    Dep.target = this;
    const oldValue = commonUtils.getVal(this.attrValue, this.vm);
    // 这里需要设为Null，第一次解析后，当message值改变后
    // 还会调用get方法，那时Dep.target不为null的话会，
    // 会一直向dep.addSub添加watcher
    Dep.target = null;
    return oldValue;
  }
  update() {
    const newValue = commonUtils.getVal(this.attrValue, this.vm);
    if (newValue !== this.oldValue) {
      this.callback(newValue);
    }
  }
}
/**
 *   发布者
 */
class Dep {
  constructor() {
    this.subs = [];
  }
  // 添加观察者
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 通知观察者去更新node
  notify() {
    console.log("通知观察者", this.subs);
    this.subs.forEach(watcher => {
      watcher.update();
    })
  }
}

/**
 * Observer 监视数据变化
 */
class Observer {
  constructor(data) {
    this.observe(data);
  }
  observe(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key]);
      })
    }
  }
  // 监视数据 Object.defineProperty
  defineReactive(obj, key, value) {
    // 递归遍历
    this.observe(value);
    // 一个属性，对应一个Dep对象
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        if (Dep.target) {
          // Dep.target 就是Watcher
          dep.addSub(Dep.target);
        }
        return value;
      },
      set: (newValue) => {
        this.observe(newValue);
        if (newValue === value) {
          return;
        }
        value = newValue;
        dep.notify();
      }
    })
  }
}