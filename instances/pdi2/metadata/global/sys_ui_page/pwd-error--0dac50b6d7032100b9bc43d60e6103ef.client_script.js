setViewportForMobile();
$j('title').text("${gs.getMessage('Password Reset - Error')}");

if (isMobile()) {
    gel("redirect_url_msg").href = "/oauth_login.do";
}

function isMobile() {
    var ua = window.navigator.userAgent;
    if (ua.match(/Android/i) ||
        ua.match(/webOS/i) ||
        ua.match(/iPhone/i) ||
        ua.match(/iPad/i) ||
        ua.match(/iPod/i) ||
        ua.match(/BlackBerry/i) ||
        ua.match(/Windows Phone/i))
        return true;
    return false;
}

//For WCAG AA .
$j(document).ready(function() {
    $j("#pwdErrorContainer").focus();
});
