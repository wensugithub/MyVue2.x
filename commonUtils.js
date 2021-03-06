// 共通属性, 方法定义
const commonUtils = {
  // 匹配mustache
  regex: /\{\{(.+?)\}\}/g,
  // 判断是dom中元素对象还是字符串
  isElementNode(node) {
    return node.nodeType === 1;
  },
  // 判断是dom中文本对象还是字符串
  isTextNode(node) {
    return node.nodeType === 3;
  },
  // 判断是否是v-前缀开头
  isStartWithVPrefix(attrName) {
    return attrName.startsWith("v-");
  },
  // 取出vue data中定义的属性值
  getVal(attrValue, vm) {
    return attrValue.split(".").reduce(function(result, currentValue) {
      return result[currentValue];
    },vm);
  },
  // 取出vue data中定义的属性值
  setVal(attrValue, vm, inputVal) {
    let length = attrValue.split(".").length;
    return attrValue.split(".").reduce(function (result, currentValue, currentIndex) {
      // person.name中的最后的name进行赋值
      if (length - 1 === currentIndex) {
        result[currentValue] = inputVal;
      }
      return result[currentValue];
    }, vm)
  },
  // 为了替换 {{person.name}} -- {{person.age}}
  getContentVal(attrValue, vm) {
    return attrValue.replace(this.regex, (...args) =>{
      return this.getVal(args[1], vm);
    })
  },
  // 取出文本属性值
  text(node, attrValue, vm) {
    let value;
    if (attrValue.indexOf("{{") !== -1) {
      // {{person.name}}--{{person.age}}
      let temp = this;
      value = attrValue.replace(this.regex, function (target, m1) {
        // 绑定观察者, 将来数据发生变化时会去调用
        new Watcher(vm, m1, () => {
          temp.updater.textUpdater(node, temp.getContentVal(attrValue, vm));
        });
        return temp.getVal(m1, vm);
      });
    } else {
      // v-text="person.age"中的person.age
      value = this.getVal(attrValue, vm);
      // 绑定观察者, 将来数据发生变化时会去调用
      new Watcher(vm, attrValue, (newValue) => {
        this.updater.textUpdater(node, newValue);
      });
    }
    this.updater.textUpdater(node, value);
  },
  // 取出html属性值
  html(node, attrValue, vm) {
    const value = this.getVal(attrValue, vm);
    // 绑定观察者, 将来数据发生变化时会去调用
    new Watcher(vm, attrValue, (newValue) => {
      this.updater.htmlUpdater(node, newValue);
    });
    this.updater.htmlUpdater(node, value);
  },
  // 取出model属性值
  model(node, attrValue, vm) {
    const value = this.getVal(attrValue, vm);
    // 绑定观察者, 将来数据发生变化时会去调用 数据 -> 视图
    new Watcher(vm, attrValue, (newValue) => {
      this.updater.modelUpdater(node, newValue);
    });
    //  视图 -> 数据 -> 视图
    node.addEventListener("input", e => {
      // 设置值
      this.setVal(attrValue, vm, e.target.value);
    })
    this.updater.modelUpdater(node, value);
  },
  updater: {
    textUpdater(node, value) {
      // <div v-text="message">value</div>
      node.textContent = value;
    },
    htmlUpdater(node, value) {
      // <div v-html="message">value</div>
      node.innerHTML = value;
    },
    modelUpdater(node, value) {
      // <input type="text" v-model="message">
      node.value = value;
    }
  }
}