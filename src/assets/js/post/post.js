$(function () {
    //为超链接加上target='_blank'属性
    $(document).bind('DOMNodeInserted', function () {
        addBlankTargetForLinks();
    });
});

function addBlankTargetForLinks() {
    $('.md-preview a[href^="http"]').each(function () {
        $(this).attr('target', '_blank');
    });
}
