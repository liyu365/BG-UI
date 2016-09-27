window.liyu_conf = {
    defaultHash: 'desktop.html',
    baseURL: '/tpl/'
};
function checkURL() {
    var arr = location.href.split("#");
    var hash = '';
    if (arr.length > 1) {
        hash = arr[1];
    }
    if (hash !== '') {
        loadURL(hash);
    } else {
        loadURL(liyu_conf.defaultHash);
    }

}
function loadURL(url) {
    var content = $('#content');
    var target = liyu_conf.baseURL + url;
    $.ajax({
        type: 'get',
        url: target,
        cache: false,
        data: '',
        dataType: 'html',
        beforeSend: function () {
            window.location.hash = url;
            content.html('<h1 class="ajax-loading-animation"><i class="fa fa-refresh fa-spin"></i> Loading...</h1>');
            var title = '';
            var $breadcrumb = $('#ribbon .breadcrumb');
            title = $('nav a[href="' + '#' + url + '"]').find('span').text();
            if (url != liyu_conf.defaultHash && title != '') {
                $breadcrumb.html('<li><i class="fa fa-home"></i>工作台</li><li>' + title + '</li>');
            } else {
                $breadcrumb.html('<li><i class="fa fa-home"></i>工作台</li>');
            }
            //console.log(title);
        },
        success: function (returnData) {
            setTimeout(function () {
                content.css('opacity', 0).html(returnData);
                content.animate({'opacity': 1}, {
                        queue: false, duration: 200, complete: function () {

                        }
                    }
                );
            }, 200);
        },
        error: function () {
            content.html('<h4 class="ajax-loading-error"><i class="fa fa-warning"></i> Error 404! 页面不存在</h4>');
        }
    })
}
checkURL();
$(document).on("click", 'nav a[href="#"]', function (e) {
    e.preventDefault();
});
$(window).on('hashchange', function () {
    checkURL();
});

//header三个按钮
(function () {
    var $left_panel = $('#left_panel');
    var $body = $('body');
    var $toggleMenu_btn = $('#page_header .toggleMenu_btn');
    $toggleMenu_btn.on('click', function () {
        $body.removeClass('minified');
        if (parseInt($left_panel.css('left')) == 0) {
            $left_panel.css('left', 220);
            $toggleMenu_btn.addClass('active');
        } else {
            $left_panel.css('left', 0);
            $toggleMenu_btn.removeClass('active');
        }
    });
    $(window).on('resize', function () {
        if ($(window).width() >= 767) {
            $left_panel.css('left', 0);
            $toggleMenu_btn.removeClass('active');
        } else {
            $body.removeClass('minified');
        }
    });
})();

//主导航
(function () {
    var $nav = $('#left_panel nav');
    var $a = $nav.find('a');
    $a.each(function () {
        var $btn = $(this);
        var $parent_li = $btn.parent();
        var $ul = $btn.next('ul');
        var $i = $btn.find('b i');
        if ($ul.length >= 1) {
            $btn.on('click', function () {
                var ul_orgH = $ul.innerHeight();
                if (!$parent_li.hasClass('open')) {
                    $parent_li.addClass('open');
                    $ul.css({'height': 0}).css('display', 'block');
                    $i.removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
                    $ul.animate({"height": ul_orgH}, {
                            queue: false, duration: 200, complete: function () {
                                $ul.css('height', 'auto');
                            }
                        }
                    );
                } else {
                    $parent_li.removeClass('open');
                    $i.removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                    $ul.animate({"height": 0}, {
                            queue: false, duration: 200, complete: function () {
                                $ul.css({'height': "auto"}).css('display', 'none');
                            }
                        }
                    );
                }

                $others_li = $btn.parent().siblings('.open');
                $others_li.each(function () {
                    var $parent_li = $(this);
                    var $btn = $parent_li.find('a:first');
                    var $ul = $btn.next('ul');
                    var $i = $btn.find('b i');
                    $parent_li.removeClass('open');
                    $i.removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                    $ul.animate({"height": 0}, {
                            queue: false, duration: 200, complete: function () {
                                $ul.css({'height': "auto"}).css('display', 'none');
                            }
                        }
                    );
                });
            });
        }
    });

    var $minifyBtn = $('#left_panel .minifyBtn');
    var $body = $('body');
    $minifyBtn.on('click', function () {
        $('#left_panel nav li.open').each(function () {
            var $parent_li = $(this);
            var $btn = $parent_li.find('a:first');
            var $ul = $btn.next('ul');
            var $i = $btn.find('b i');
            $parent_li.removeClass('open');
            $i.removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
            $ul.css({'height': "auto"}).css('display', 'none');
        });
        if (!$body.hasClass('minified')) {
            $body.addClass('minified');
        } else {
            $body.removeClass('minified');
        }
    });
})();

//ajax内容弹出框
(function () {
    var $modal_ajax_content = $("#modal_ajax_content");
    $(document).on('click', '.J_ajax_content_modal', function () {
        var $btn = $(this);
        if (typeof $btn.attr('data-href') !== 'undefined') {
            $.ajax({
                type: 'get',
                url: $btn.attr('data-href'),
                cache: false,
                data: '',
                dataType: 'html',
                beforeSend: function () {
                },
                success: function (returnData) {
                    $modal_ajax_content.find('.modal-content').html(returnData);
                    $modal_ajax_content.modal('show');
                },
                error: function () {
                    alert("未找到模板");
                }
            });
        } else {
            console.log("请配置'data-href'属性");
        }
    });
})();

//确认弹出框
(function () {
    var $modal_confirm = $("#modal_confirm");
    var target = '';
    $(document).on('click', '.J_confirm_modal', function () {
        var $btn = $(this);
        var tip = '确认吗？';
        if (typeof $btn.attr('data-tip') !== 'undefined') {
            tip = $btn.attr('data-tip');
        }
        target = $btn.attr('data-target');
        $modal_confirm.find('.modal-body').html('<h4 style="text-align:center;">' + tip + '</h4>');
        $modal_confirm.modal({
            backdrop: 'static'
        });
    });
    $modal_confirm.on('click', '.J_confirm_btn', function () {
        console.log(target);
        setTimeout(function () {
            $modal_confirm.modal('hide');
        }, 2000);
    });
})();

//J_ajaxSubmitBtn绑定事件
(function () {
    $(document).on('click', '.J_ajaxSubmitBtn', function () {
        var $btn = $(this);
        var $from = null;
        $from = $btn.parent().parent();
        new AjaxForm($from, {
            type: $from.attr("method"),  //提交方式
            url: $from.attr("action"),  //提交地址
            subBtn: $from.find(".J_ajaxSubmitBtn"),  //提交按钮
            enterSend: $from.attr("data-enterSend") === 'on',  //是否支持回车提交
            sendingText: $from.attr("data-sendingText"),  //提交中的按钮文字
            useDefaultCallBack: $from.attr("data-useDefaultCallBack") !== 'off', //是否调用默认回调函数(只要值不为'off'都调用)
            callBack: typeof $from.attr("data-callBack") !== 'undefined' ? eval('(' + 'callback.' + $from.attr("data-callBack") + ')') : false,  //自定义回调函数
            validateInt: typeof $from.attr("data-validate-init") !== 'undefined' ? eval('(' + 'validate.' + $from.attr("data-validate-init") + ')') : false,  //初始验证函数
            validateFinally: typeof $from.attr("data-validate-finally") !== 'undefined' ? eval('(' + 'validate.' + $from.attr("data-validate-finally") + ')') : false  //最终验证函数
        });
    });
})();
