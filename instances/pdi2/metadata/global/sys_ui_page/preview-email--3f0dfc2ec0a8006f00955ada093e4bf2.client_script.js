
$j('#email_preview_iframe').on('load', function() {
	adjustIFrameSize($j(this));
});

function adjustIFrameSize(iframe) {
    var height = 0;

    if (isMSIE9 || isMSIE10) {
        height = iframe.contents().find('body').outerHeight(true);
    } else {
        height = iframe.contents().height();
    }
	iframe.height(height);
	iframe.width(iframe.parent().width());
}
