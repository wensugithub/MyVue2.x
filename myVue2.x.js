/**
 * Vue模拟实现
 */
class MyVue {
  constructor(options) {
    // 1. 保存数据
    this.$options = options;
    this.$data = options.data;
    this.$el = options.el;
    if (this.$el) {
      // 2. 创建Observer来监控数据的变化
      new Observer(this.$data);
      // 3. 代理 核心就是vue.data的属性 赋值给 vue
      Object.keys(this.$data).forEach(attr => {
          this._proxy(attr);
        }
      );
      // 4. 创建Compile
      new Compiler(this.$el, this);
    }
  }
  // 对vue实例中的data对象进行代理
  _proxy(attr) {
    Object.defineProperty(this, attr, {
      enumerable: true,
      configurable: true,
      set(newValue) {
        this.$data[attr] = newValue;
      },
      get() {
        return this.$data[attr];
      }
    })
  }
}

