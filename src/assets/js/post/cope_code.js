$(function() {
    //代码高亮
    hljs.initHighlightingOnLoad();

    //复制代码
    $('.md-preview pre').hover(function () {
        var div_copy_code = "<a data-toggle='tooltip' data-placement='right' title='点击复制代码' class='copy-code-wrapper' onclick='copyCode(this);'>复制</a>";
        if ($(this).children('.copy-code-wrapper').length <= 0) {
            $(div_copy_code).prependTo($(this));
            var top = $(this).offset().top,
                left = $(this).offset().left + $(this).outerWidth() - $(this).children('.copy-code-wrapper').outerWidth();
            $(this).children('.copy-code-wrapper').offset({
                'top': top,
                'left': left
            });
            $(this).children('.copy-code-wrapper').tooltip();
        }
    }, function () {
        $(this).children('.copy-code-wrapper').remove();
    });
})

function copyCode(target) {
    var copy_text = $(target).nextAll('code').text();
    clipboard.copy(copy_text).then(function () {
        $(target).text('已复制');
        $(target).attr('title', "代码已成功复制").tooltip('fixTitle').tooltip('show');
    });
}