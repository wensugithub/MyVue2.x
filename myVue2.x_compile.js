/**
 * 1.编译dom, 初始化赋值
 * 2.新建Watcher
 */
class Compiler {
  constructor(el, vm) {
    // 获取到当前传入的dom元素。例如: #app
    this.el = commonUtils.isElementNode(el) ? el : document.querySelector(el);
    // 保存当前vue实例
    this.vm = vm;
    // 1.创建文档碎片对象,放入内存中，减少页面的回流(reflow)和重绘(repaint)
    const fragment = this._createFragment();
    // 2.编译模板
    this._compile(fragment);
    // 3.将片段加入到dom中
    this.el.appendChild(fragment);
  }
  // 创建片段
  _createFragment() {
    // 能做什么: 创建一个虚拟的节点对象，或者说，是用来创建文档碎片节点
    // 什么特点: DocumentFragment存在于内存中，并不在DOM中
    // 为什么用: 当需要添加多个dom元素时，如果先将这些元素添加到DocumentFragment中，再统一将DocumentFragment添加到页面
    //           减少浏览器对dom渲染次数，效率会明显提升
    const frag = document.createDocumentFragment();
    let child;
    while(child = this.el.firstChild) {
      // 如果添加的child是文档中存在的元素，则通过appendChild在为其添加子元素时，会从文档中删除之前存在的元素
      frag.appendChild(child);
    }
    return frag;
  }
  // 编译模板, 匹配dom和Watcher
  _compile(fragment) {
    const childNodes = fragment.childNodes;
    childNodes.forEach(childNode => {
      if (commonUtils.isElementNode(childNode)) {
        // 是否是元素节点
        this._compileElement(childNode);
      }
      if(commonUtils.isTextNode(childNode)) {
        // 是否是文本节点
        this._compileText(childNode);
      }
      // 元素节点的子元素也取出<h2>{{msg}}</h2>
      if (childNode.childNodes && childNode.childNodes.length) {
        this._compile(childNode);
      }
    })
  }
  // 编译属性节点
  _compileElement(node) {
    // <div v-text="message"></div>
    // 为了遍历, 将伪数组转为数组
    const attributeList = Array.prototype.slice.call(node.attributes);
    attributeList.forEach(attr => {
      // attr: v-text="message"
      // 判断是否以v-开头， v-text, v-html, v-model
      if (commonUtils.isStartWithVPrefix(attr.name)) {
        // 取出text, html, model等
        const attrName = attr.name.split("-")[1];
        // 数据驱动视图 value: v-text="message"中的message等
        commonUtils[attrName](node, attr.value, this.vm);
        // 删除v-属性
        node.removeAttribute("v-" + attrName);
      }
    })
  }
  // 编译文本节点
  _compileText(node) {
    // {{}}
    const content = node.textContent;
    if (commonUtils.regex.test(content)) {
      commonUtils['text'](node, content, this.vm);
    }
  }
}