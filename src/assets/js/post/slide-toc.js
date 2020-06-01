$(function() {
    //如果文章没有标题不会显示侧边栏
    var has_toc = $('.md-preview h1,.md-preview h2,.md-preview h3').length > 0;
    if (has_toc) {
        $('.navbar-side').removeClass('hidden');
        // 初始化 侧边栏
        initSlide();
    }

    //toc滚动设置
    $(window).scroll(function () {
        setTocPosition();
    });
})

// 显示侧边栏
function initSlide() {
    $('.navbar-side').css('right', 0);
    $('.article-left').addClass('has-side');
    //初始化toc
    $('#toc').toc({
        'selectors': 'h1,h2,h3', //elements to use as headings
        'container': '.md-preview', //element to find all selectors in
        'prefix': 'toc',
        'highlightOffset': 1, //offset to trigger the next headline
        'anchorName': function (i, heading, prefix) { //custom function for anchor name
            return prefix + i;
        }
    });
    setTimeout(function () {
        setTocPosition();
    }, 10);
}

//关闭侧边栏
function hideSlide(e) {
    $('.navbar-side').css('right', '-268px');
    $('#toc').empty();
    setTimeout(function () {
        $('.article-left').removeClass('has-side');
    }, 200);
}

//设置toc的位置
function setTocPosition() {
    var max_height = $('.md-preview').offset().top + $('.md-preview').outerHeight() - $('#toc').outerHeight(),
        scroll_top = $(window).scrollTop(),
        header_height = $('header').outerHeight();
    if (scroll_top <= header_height) {
        $('.toc-wrapper').removeClass('position-fixed').addClass('position-absolute').removeAttr('style');
    } else if (scroll_top > header_height && scroll_top <= max_height) {
        $('.toc-wrapper').removeAttr('style');
        $('.toc-wrapper').removeClass('position-absolute').addClass('position-fixed');
    } else {
        $('.toc-wrapper').removeClass('position-fixed')
            .addClass('position-absolute')
            .css("top", max_height - $('.md-preview').offset().top);
    }
}
