$(function () {
    //回到顶部显示隐藏控制
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 400) {
            $('#cd_top').fadeIn(400);
        } else {
            $('#cd_top').fadeOut(400);
        }
    });
    
    //回到顶部
    $('#cd_top').click(function () {
        $('html,body').animate({scrollTop: '0px'}, 600);
        return false;
    });
});