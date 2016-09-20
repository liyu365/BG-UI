$("#load").on("click", function () {
    $.ajax({
        type: 'get',
        url: '/tpl/1.html',
        data: '',
        dataType: 'html',
        success: function (returnData) {
            $("#content").html(returnData);
        },
        error: function () {

        }
    })
});


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
                    $ul.css('height', 0).css('display', 'block');
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
                                $ul.css('height', 'auto').css('display', 'none');
                            }
                        }
                    );
                }
            });
        }
    });
})();
