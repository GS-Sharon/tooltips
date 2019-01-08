/**
 * hullabaloo v 0.4
 *
 */
import * as $ from "jquery";

// 引入插件css
require("./css/fontawesome.min.css");
require("./css/notice.css");

// 公共配置
interface options {
    // 限制指定父元素内，即在$(ele)内，默认为"body"
    ele: string,
    // 位移{from：指定y轴出现的方向，参数为top、bottom，默认为top，amount：相当于初始marginTop，即第一个提示的marginTop，默认为20}
    offset:{from:string,amount:number},
    // 提示在x轴出现的位置：align、left、right，默认为right
    align: string,
    // 限制文本框的宽度，默认为250
    width: number,
    // 设置让文本框消失的间隔时间，默认为5000
    delay: number,
    // 是否显示关闭按钮，默认为true
    allow_dismiss: boolean,
    // 不同提示之间的间距，相当于margin-top，默认为10
    stackup_spacing: number,
    // 提示文本，默认为""
    text: string,
    // 关于不同类别的icon的设置
    icon: {
        // 成功提示
        success: string,
        // 普通提示
        info: string,
        // 警告提示
        warning: string,
        // 危险操作
        // danger: string,
        // 亮暗色，一般不会用到
        // light: string,
        // dark: string
    },
    // 指定提示状态，即类别，参考icon的key，默认为danger
    status: string,
    // 弹出框需要额外添加的类名
    alertClass: string, 
    // 如果传入的是函数则代表弹出前执行
    fnStart: boolean, 
    // 弹出结束执行
    fnEnd: boolean, 
    // 弹出结束后隐藏时执行
    fnEndHide: boolean, 
    // 是否禁止关闭，便于调样式，默认false
    isShow: boolean,
    // 是否想要在窗口顶层body进行弹出，默认false
    ifTopAlert: boolean
};

export class Notice {
    // 目标正在建造中
    // 创建 this.generate()
    public hullabaloo:any = {};
    // 提示框对象数组
    public hullabaloos:any[] = [];
    private success:boolean = false;
    private options:any;
    public text:string;
    public status:string;
    private elem:any;
    public parent:any;
    public position: number;
    public timer:any;
    private defaultOptions:any = {
      ele: "body",
      offset: {
          from: "top",
          amount: 20
      },
      align: "right",
      width: 250,
      delay: 5000,
      allow_dismiss: true,
      stackup_spacing: 10,
      text: "",
      icon: {
          success: "gisIconfont gisIcon-chenggong",
          info: "gisIconfont gisIcon-tishi",
          warning: "gisIconfont gisIcon-shibai",
          // danger: "fa fa-exclamation-circle",
          // light: "fa fa-sun",
          // dark: "fa fa-moon"
      },
      status: "info",
      alertClass: "", // 弹出框需要额外添加的类名
      fnStart: false, // 如果传入的是函数则代表弹出前执行
      fnEnd: false, // 弹出结束执行
      fnEndHide: false, // 弹出结束后隐藏时执行
      isShow: false,
      ifTopAlert: false
    };

    constructor(options:options) {
        let self = this;
        this.options = this.defaultOptions;
        if(Object.keys(options).length>0) {
          Object.keys(options).forEach((attr:string) => {
            if(Object.keys(options[attr]).length) {
              this.options[attr] = {...self.options[attr],...options[attr]};
            } else {
              this.options[attr] = options[attr];
            }
          })
        }
    }

    /*
    * 弹出信息配置
    * text - 信息文字
    * status - 当前状态
    * group - 消息分组
    */
    send(text, status, group = 1) {
        // 弹出前执行
        if (typeof this.options.fnStart == "function")
        this.options.fnStart();
        // 弹出实例自身
        var self = this;
        // 是否遇到相同警报
        var flag = 1;
        // 遍历警报组的变量i
        var i = +this.hullabaloos.length - 1;
        var parent;
        // 警报生成器
        let hullabaloo:any = this.generate(text, status);
        this.status = status;
        this.text = text;
        // 是否要求警报分组并且当前警报组队列长度大于0
        if (group && this.hullabaloos.length) {
            // 开始遍历警报组
            while (i >= 0 && flag) {
            // 遇到相同警报
            if (this.hullabaloos[i].text == this.text && this.hullabaloos[i].status == this.status) {
                // 记录
                parent = this.hullabaloos[i];
                self.parent = parent;
                flag = 0;
                // 当前警报将会与前一个相同的那个进行合并显示
                hullabaloo.elem.css(this.options.offset.from, parseInt(parent.elem.css(this.options.offset.from)) + (+parent.hullabalooGroup.length +1)*4);
                hullabaloo.elem.css(this.options.align, parseInt(parent.elem.css(this.options.align)) + (+parent.hullabalooGroup.length +1)*4);
            }
            i--;
            }
        }
        if(!this.options.isShow) {
          if (typeof parent == 'object') {
            // 检测存在与当前同类的警报，将重置该类警报定时器
            clearTimeout(parent.timer);
            // 为该组添加定时器
            parent.timer = setTimeout(function() {
                self.closed(self.parent);
            }, this.options.delay);
            hullabaloo.parent = parent;
            // 将当前警告放入最先相同元素的hullabalooGroup属性队列中
            parent.hullabalooGroup.push(hullabaloo);
            // 如果未检测到同类
          } else {
              let hullabalooElem:any = hullabaloo.elem;
              hullabaloo.position = parseInt(hullabalooElem.css(this.options.offset.from));
          
              // 为自身设置消失定时器
              hullabaloo.timer = setTimeout(function() {
                  self.closed(hullabaloo);
              }, this.options.delay);
              // 将警报添加到一般警报阵列中
              this.hullabaloos.push(hullabaloo);
          }
        } else {
          if (typeof parent == 'object') {
            hullabaloo.parent = parent;
            // 将当前警告放入最先相同元素的hullabalooGroup属性队列中
            parent.hullabalooGroup.push(hullabaloo);
          } else {
            let hullabalooElem:any = hullabaloo.elem;
            hullabaloo.position = parseInt(hullabalooElem.css(this.options.offset.from));
             // 将警报添加到一般警报阵列中
             this.hullabaloos.push(hullabaloo);
          }
        }
        // 向用户展示警报，淡出
        hullabaloo.elem.fadeIn();
    
        // 启动淡出完成函数
        if (typeof this.options.fnEnd == "function")
        this.options.fnEnd();


    }

    // 警报生成器
    generate(text:string, status) {
      var alertsObj = {
        icon: "", // Иконка
        status: status || this.options.status, // Статус
        text: text || this.options.text, // 文字
        elem: $("<div>"), // HTML код самого алерта

        // 相同的警报组
        hullabalooGroup: []
      };
      var option, // 设置
          offsetAmount, // 位移数值
          css; // CSS属性设置
      var self = this,
      option = this.options;

      // 额外添加的类
      alertsObj.elem.attr("class", "hullabaloo alert "+option.alertClass);

      // 添加状态类
      alertsObj.elem.addClass("alert-" + alertsObj.status);

      // 设置允许关闭
      if (option.allow_dismiss) {
        alertsObj.elem.addClass("alert-dismissible");
        alertsObj.elem.append("<button class=\"close\" type=\"button\" id=\"hullabalooClose\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>");
        $( "#hullabalooClose", $(alertsObj.elem) ).bind( "click", function(){
          self.closed(alertsObj);
        });
      }

      // 根据警告弹出的类别进行设置icon
      switch (alertsObj.status) {
        case "success":
          alertsObj.icon = option.icon.success;
          break;
        case "info":
          alertsObj.icon = option.icon.info;
          break;
        case "danger":
          alertsObj.icon = option.icon.danger;
          break;
        case "light":
          alertsObj.icon = option.icon.light;
          break;
        case "dark":
          alertsObj.icon = option.icon.dark;
          break;
        default:
          alertsObj.icon = option.icon.warning;
      }

      // 追加警告弹出的文本内容
      alertsObj.elem.append("<i class=\"" + alertsObj.icon + "\"></i> " + alertsObj.text);

      // 第一个出现的警报位置为option.offset.amount
      offsetAmount = option.offset.amount;

      // 记录最新出现警报的位置
      let hullabalooArray;
      if(option.ifTopAlert) {
        hullabalooArray = $(top.document.body).find(".hullabaloo");
      } else {
        hullabalooArray = $(".hullabaloo");
      }
      hullabalooArray.each(function() {
        let ele:any = $(this);
        offsetAmount = Math.max(offsetAmount, parseInt(ele.css(option.offset.from)) + $(this).outerHeight() + option.stackup_spacing);
      });


      // css配置
      css = {
        //设置了限制的父元素内
        "position": (option.ele === "body" ? "fixed" : "absolute"),
        "margin": 0,
        "z-index": "9999",
        "display": "none"
      };
      css[option.offset.from] = offsetAmount + "px";
      alertsObj.elem.css(css);

      if (option.width !== "auto") {
        alertsObj.elem.css("width", option.width + "px");
      }
      if(option.ifTopAlert) {
        $(top.document.body).append(alertsObj.elem);
        console.log($(alertsObj.elem).css("top"))
      } else {
        $(option.ele).append(alertsObj.elem);
      }
      
      switch (option.align) {
        case "center":
          alertsObj.elem.css({
            "left": "50%",
            "margin-left": "-" + (alertsObj.elem.outerWidth() / 2) + "px"
          });
          break;
        case "left":
          alertsObj.elem.css("left", "20px");
          break;
        default:
          alertsObj.elem.css("right", "20px");
      }

      return alertsObj;
    }
    
    // 关闭功能
    closed(hullabaloo:any) {
      var self = this;
      var idx, i, move, next;

      // 目标警报（即要关闭的警报）：如果警报有parent属性，即有同类警报组，hullabaloo为最先出现的警报实例
      if("parent" in hullabaloo){
        hullabaloo = hullabaloo.parent;
      }

      // 检查是否有警报队列
      if (this.hullabaloos !== null) {
        
        // 从警报组中找到目标警报所在的索引
        idx = $.inArray(hullabaloo, this.hullabaloos);
        if(idx == -1) return;

        // 判断是否是同类警报组，如果是则逐个关掉
        if (!!hullabaloo.hullabalooGroup && hullabaloo.hullabalooGroup.length) {
          for (i = 0; i < hullabaloo.hullabalooGroup.length; i++) {
            $(hullabaloo.hullabalooGroup[i].elem).remove();
          }
        }

        // 把同类警报组的代表parent给关掉
        $(this.hullabaloos[idx].elem).fadeOut("slow", function(){
          this.remove();
        });

        if (idx !== -1) {
          next = idx + 1;
          // 如果警报队列中还有其他警报，则进行移动到目标警报的位置
          if (this.hullabaloos.length > 1 && next < this.hullabaloos.length) {
            //紧随目标警报的下一个警报-目标警报目标警报的位置=要移动的距离
            move = this.hullabaloos[next].position - this.hullabaloos[idx].position;

            // 剩余跟随目标警报的所有警报进行上移
            for (i = next; i < this.hullabaloos.length; i++) {
              this.animate(self.hullabaloos[i], parseInt(self.hullabaloos[i].position) - move);
              self.hullabaloos[i].position = parseInt(self.hullabaloos[i].position) - move
            }
          }

          // 从警报队列中移除目标警报
          this.hullabaloos.splice(idx, 1);

          //启动消息关闭后函数
          if (typeof this.options.fnEndHide == "function")
            this.options.fnEndHide();
        }
      }
    }

    // 警报上移动画功能
    animate(hullabaloo:any, move:number) {
      var self = this;
      let timer,
        position, //警报的位置
        i, //遍历同类警报组的变量
        group = 0; // 同类警报组的长度

      // 目标警报的位置
      position = parseInt(hullabaloo.elem.css(self.options.offset.from));
      // 同类警报组的数量
      group = hullabaloo.hullabalooGroup.length;

      // 启动定时器，2是关于动画的步长
      timer = setInterval(frame, 2);
      // 定时器执行函数
      function frame() {
        if (position == move) {
          clearInterval(timer);
        } else {
          position--;
          hullabaloo.elem.css(self.options.offset.from, position);

          // 如果需要上升的警报中有同类警报，则一起提升
          if (group) {
            for (i = 0; i < group; i++) {
              hullabaloo.hullabalooGroup[i].elem.css(self.options.offset.from, position + 4*(i+1));
            }
          }
        }
      }
    }


}
  

