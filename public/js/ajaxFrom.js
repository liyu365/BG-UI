function AjaxForm($form, options) {
    var _this = this;
    _this.$form = $form;
    //初始化变量
    _this.init(options);
    //调用初始验证函数
    typeof _this.validateInt === 'function' && _this.validateInt(_this.$form);
    //监听提交按钮点击事件
    _this.send();
    //监听回车事件
    if (_this.enterSend) {
        _this.$form.find('input').on('keydown', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                _this.send();
            }
        });
    }
}

AjaxForm.prototype.init = function (options) {
    var _this = this;
    var opts = options || {};
    _this.referer = null;
    _this.sending = false;
    _this.data = ''; //发送给服务器的数据
    _this.dataType = 'json';  //服务器返回数据的格式
    _this.returnData = ''; //服务器返回的数据
    //默认的回调函数
    _this.defaultCallBack = function (returnData) {
        if (_this.useDefaultCallBack) {
            /*_this.dialog = popBox({
                title: '提示',
                content: message,
                ok: true,
                init: function () {
                    _this.$subBtn.addClass('subBtn_unable');  //弹出框弹出后，让表单的提交动作失效，防止重复弹出
                },
                close: function () {
                    _this.$subBtn.removeClass('subBtn_unable');  //关闭弹出框后，恢复表单的提交动作
                    if (_this.referer) {
                        setTimeout(function () {
                            window.location.href = _this.referer;
                        }, 10);
                    }
                }
            });*/
            $("#modal_ajax_content").modal('hide');
        }
    };

    //获取请求提交方式
    _this.type = opts.type;
    //获取请求提交地址
    _this.url = opts.url;
    //获取提交按钮
    _this.$subBtn = opts.subBtn;
    //获取提交按钮的默认文字
    if (_this.$subBtn[0].nodeName.toLowerCase() == 'input') {
        _this.subBtnText = _this.$subBtn.val();
    } else {
        _this.subBtnText = _this.$subBtn.text();
    }
    //是否按回车自动提交表单
    _this.enterSend = opts.enterSend;
    //获取按钮中的发送提示文字
    _this.sendingText = opts.sendingText;
    //获取自定义回调函数名，它和默认回调并不冲突，也就是说只要定义了自定义回调函数就一定会被执行
    _this.callBack = opts.callBack;
    //获取自定义'初始化'验证函数名
    _this.validateInt = opts.validateInt;
    //获取自定义'最终'验证函数名
    _this.validateFinally = opts.validateFinally;
    //是否执行默认回调
    _this.useDefaultCallBack = opts.useDefaultCallBack;
};

AjaxForm.prototype.send = function () {
    var _this = this;
    if (!_this.sending && !_this.$subBtn.hasClass('subBtn_unable')) {
        //调用'最终'验证函数
        if (typeof _this.validateFinally === 'function') {
            var vali = _this.validateFinally(_this.$form);
            if (!vali) {
                //如果验证函数传回来的是false，则立刻跳出程序
                return false;
            }
        }
        _this.sending = true;

        //改变发送按钮状态
        if (typeof _this.sendingText !== 'undefined') {
            if (_this.$subBtn[0].nodeName.toLowerCase() == 'input') {
                _this.$subBtn.val(_this.sendingText);
            } else {
                _this.$subBtn.text(_this.sendingText);
            }
        }
        _this.$subBtn.addClass('subBtn_sending');

        _this.data = _this.$form.serialize();

        $.ajax({
            type: _this.type,
            url: _this.url,
            data: _this.data,
            dataType: _this.dataType,
            success: function (returnData) {
                _this.returnData = returnData;
                console.log(_this.returnData);
                if ($.trim(_this.returnData.state) == 'success') {
                    _this.defaultCallBack(_this.returnData);  //执行默认回调
                    typeof _this.callBack === 'function' && _this.callBack(_this.returnData, _this.$form); //执行自定义回调
                    if (_this.returnData.refresh === true) {
                        if($.trim(_this.returnData.referer)){
                            //根据返回的hash加载页面
                            loadURL($.trim(_this.returnData.referer));
                        }else{
                            //刷新本页
                            checkURL();
                        }
                    }
                    //重置表单
                    _this.$form[0].reset();
                    //调用初始验证函数
                    typeof _this.validateInt === 'function' && _this.validateInt(_this.$form);
                } else {
                    _this.defaultCallBack(_this.returnData);  //执行默认回调
                    typeof _this.callBack === 'function' && _this.callBack(_this.returnData, _this.$form); //执行自定义回调
                }
                //重置发送按钮状态
                if (_this.$subBtn[0].nodeName.toLowerCase() == 'input') {
                    _this.$subBtn.val(_this.subBtnText);
                } else {
                    _this.$subBtn.text(_this.subBtnText);
                }
                _this.$subBtn.removeClass('subBtn_sending');
                _this.sending = false;
            },
            error: function () {
                alert('请求失败!!!!!!');
                //重置发送按钮状态
                if (_this.$subBtn[0].nodeName.toLowerCase() == 'input') {
                    _this.$subBtn.val(_this.subBtnText);
                } else {
                    _this.$subBtn.text(_this.subBtnText);
                }
                _this.$subBtn.removeClass('subBtn_sending');
                _this.sending = false;
            }
        });
    }
};