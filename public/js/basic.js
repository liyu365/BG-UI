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
