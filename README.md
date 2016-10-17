#BG-UI,一个后台UI框架

##简述

此项目为UI框架，并根据url中的hash提供简单的路由功能，页面的数据渲染依然交给服务器端。
UI基于BootStrap3。

##目录结构

```
public
  ┗css
    ┠vendor      //存放第三方css文件
    ┗basic.css   //基础css
  ┗images
  ┗js
    ┠vendor      //存放第三方js文件
    ┠ajaxForm.js //所有ajax提交都由ajaxForm.js进行包装
    ┗basic.js    //基础js
tpl
  ┠...           //存放演示页面，目录结构随意
  ┠...
  ┗index.html    //主页面
server            //存放测试用服务器脚本
index.html        //入口（登录页面）
```

##配置

在主页面加载basic.js文件之前定义：

```
window.common_conf = {
    defaultHash: 'page/desktop.html',    //hash的缺省值
    baseURL: './'                        //见下文"路由"
};
```

##路由

实现方式：监听hashChange事件，利用`"common_conf.baseURL" + "当前页面的hash"`形成请求地址，并用ajax请求服务器来获取需要显示的html。

##表单的提交、验证、回调

#### 基本用法

只要页面中的`<form>`标签中包含class为`.J_ajaxSubmitBtn`的元素，则此表单均受ajaxForm.js（非第三方插件，为作者编写）控制。
当`.J_ajaxSubmitBtn`元素被点击后，ajaxForm.js会自动收集`<form>`标签上的属性值，并形成一次ajax提交，例如：

```
<form
    method="get"
    action="../server/ajaxReturn.json"
    data-validate="validate1"
    data-callBack="callback1"
    data-useDefaultCallBack="on"
    enterSend="on"
    data-sendingText="提交中"
    >
    <input type="text" placeholder="新闻标题" name="title">
    <button type="button" class="btn btn-primary J_ajaxSubmitBtn">查询</button>
</form>

<script>
    function validate1($from) {
        var title = $from.find('input[name="title"]');
        if ($.trim(title.val()) == '') {
            return '新闻标题不能为空';
        }

        return true;
    }
</script>
```

* `method`：提交方式，默认为"get"
* `action`：提交地址(必须设置)
* `data-validate`：提交之前的验证函数名
* `data-callBack`：服务器响应后的自定义回调函数名
* `data-useDefaultCallBack`：服务器响应后是否执行框架的默认动作。只要值不为'off'都会调用。
* `enterSend`：是否支持回车提交。"on"为启用，其他都为不启用
* `data-sendingText`：提交过程中`.J_ajaxSubmitBtn`的提示文字

#### 默认回调

前面的`data-useDefaultCallBack`配置项已经提到了，服务器接到响应后ajaxForm.js会执行一些默认的动作。
执行的默认动作由服务器返回的json进行定义：

```
{
  "referer": "",
  "refresh": true,
  "state": "success",
  "message": "提交成功"
}
```

* `referer`：刷新的目标地址，留空则表示刷新当前页
* `refresh`：`true|false`是否刷新
* `state`：提交是否成功，只有当值为"success"时才视为成功（才会判断是否执行刷新操作）
* `message`：提示信息，state不为"success"时会进行提示

####验证

`<form>`标签中的`data-validate`用来配置验证函数名，此验证函数在进行ajax提交前会接收到被jQuery封装的form DOM对象（具体可查看"基本用法"）。
自定义函数返回`true`则可以正常提交；可以返回字符串来对错误信息进行提示，错误的提示方式已经在框架中进行了封装。




