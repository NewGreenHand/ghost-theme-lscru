$(function () {
    //点击看大图
    $('.md-preview img').click(function (e) {
        showFullScreenImg(e);
    });

    //退出大图模式
    $('#img_wrapper').click(function () {
        exitFullScreen();
    });
})

/**
 * 按 esc 键退出 大图模式
 */
$(document).keydown(function (e) {
    e = e || event;
    if (e.keyCode == 27) // esc键
    {
        exitFullScreen();
        return false;
    }
});

/**
 * 显示大图
 * @param {*} e 事件对象 
 */
function showFullScreenImg(e) {
    $('#show_image_layer,#img_wrapper').removeClass('hidden');
    var img_src = $(e.target).attr('src');
    $('#img_wrapper img').attr('src', img_src);
    $('body').css('overflow', 'hidden');
}

/**
 * 退出大图
 */
function exitFullScreen() {
    if ($('#show_image_layer').hasClass('hidden')) {
        return;
    }
    $('#show_image_layer,#img_wrapper').addClass('hidden');
    $('#img_wrapper img').attr('src', '');
    $('body').removeAttr('style');
}