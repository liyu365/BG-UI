function AjaxForm($form, options) {
    var _this = this;
    _this.$form = $form;
    _this.opts = options;
    _this.sending = false;

    //获取提交按钮的默认文字
    if (_this.opts.$subBtn[0].nodeName.toLowerCase() == 'input') {
        _this.subBtnText = _this.opts.$subBtn.val();
    } else {
        _this.subBtnText = _this.opts.$subBtn.text();
    }

    //提交
    _this.send();
}

AjaxForm.prototype.send = function () {
    var _this = this;
    if (!_this.sending) {
        //调用'最终'验证函数
        if (typeof _this.opts.validate === 'function') {
            var vali = _this.opts.validate(_this.$form);
            if (vali !== true) {
                //如果验证函数传回来的不是true，则利用默认回调函数提示错误信息
                _this.defaultCallBack({
                    state: 'fail',
                    message: vali
                });
                return false;
            }
        }
        _this.sending = true;
        //提交按钮改为发送状态
        _this.sending_subBtn();

        $.ajax({
            type: _this.opts.type,
            url: _this.opts.url,
            cache: false,
            data: _this.$form.serialize(),
            dataType: 'json',
            success: function (returnData) {
                /*if ($.trim(returnData.state) == 'success') {
                 _this.$form[0].reset();
                 }*/
                _this.opts.useDefaultCallBack && _this.defaultCallBack(returnData);  //执行默认回调
                typeof _this.opts.callBack === 'function' && _this.opts.callBack(returnData, _this.$form); //执行自定义回调
            },
            error: function () {
                alert('请求失败!!!!!!');
                _this.opts.$subBtn.removeClass('subBtn_unable');
            },
            complete: function () {
                _this.reset_subBtn();
                _this.sending = false;
                //_this.opts.$subBtn.removeClass('subBtn_unable');  此状态在默认回调中移除
            }
        });
    }
};

AjaxForm.prototype.defaultCallBack = function (returnData) {
    var _this = this;
    var $tip = null;
    var tipText = '';
    if ($.trim(returnData.state) == 'success') {
        tipText = returnData.message ? returnData.message : '提交成功';
        $tip = $('<span class="ajaxForm_tip_success"><i class="fa fa-check-circle-o"></i> ' + tipText + '</span>');
    } else {
        tipText = returnData.message ? returnData.message : '提交失败';
        $tip = $('<span class="ajaxForm_tip_warning"><i class="fa fa-exclamation-circle"></i> ' + tipText + '</span>');
    }
    if (_this.$form.parent().hasClass('modal-content')) {
        $tip.css('float', 'left');
        $tip.css('marginTop', 5);
    } else {
        $tip.css('marginLeft', 10);
    }
    _this.opts.$subBtn.after($tip);
    setTimeout(function () {
        $tip.animate({"opacity": 0}, {
                queue: false, duration: 500, complete: function () {
                    var $modals = $('.modal');
                    //如果返回的结果成功并需要跳转
                    if ($.trim(returnData.state) == 'success' && returnData.refresh === true) {
                        //如果为绝对地址则立刻跳转出后台中心
                        if (/^(http|https).+$/.test(returnData.referer)) {
                            window.location = returnData.referer;
                            return true;
                        }
                        //如果是弹出框中的表单，需要等弹出框关闭后才能进行跳转；否则直接跳转
                        if (_this.$form.parent().hasClass('modal-content')) {
                            $modals.on('hidden.bs.modal', function () {
                                $modals.off('hidden.bs.modal');
                                if ($.trim(returnData.referer)) {
                                    //根据返回的hash加载页面
                                    window.location.hash = $.trim(returnData.referer);
                                } else {
                                    //刷新本页
                                    checkURL();
                                }
                            });
                        } else {
                            if ($.trim(returnData.referer)) {
                                //根据返回的hash加载页面
                                window.location.hash = $.trim(returnData.referer);
                            } else {
                                //刷新本页
                                checkURL();
                            }
                        }
                    }
                    //所有的弹出框开始隐藏
                    if ($.trim(returnData.state) == 'success') {
                        $modals.modal('hide');
                    }
                    //删除$tip元素本身
                    $tip.remove();
                    //提交按钮重新变为可用
                    setTimeout(function () {
                        _this.opts.$subBtn.removeClass('subBtn_unable');
                    }, 500);
                }
            }
        );
    }, 1000);
};

AjaxForm.prototype.sending_subBtn = function () {
    var _this = this;
    if (typeof _this.opts.sendingText !== 'undefined') {
        if (_this.opts.$subBtn[0].nodeName.toLowerCase() == 'input') {
            _this.opts.$subBtn.val(_this.opts.sendingText);
        } else {
            _this.opts.$subBtn.html(_this.opts.sendingText);
        }
    }
    _this.opts.$subBtn.addClass('subBtn_sending');
};

AjaxForm.prototype.reset_subBtn = function () {
    var _this = this;
    if (_this.opts.$subBtn[0].nodeName.toLowerCase() == 'input') {
        _this.opts.$subBtn.val(_this.subBtnText);
    } else {
        _this.opts.$subBtn.text(_this.subBtnText);
    }
    _this.opts.$subBtn.removeClass('subBtn_sending');
};