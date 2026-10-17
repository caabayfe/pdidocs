redirectBasedOnTheDevice();

function redirectBasedOnTheDevice() {
    var userId = g_request.getParameter("sysparm_id");
    var requestId = g_request.getParameter("sysparm_request_id");
    var token = g_request.getParameter("sysparm_token");
    var redirectUrl = GlideSecurityUtils.cleanURL(g_request.getParameter("sysparm_redirect_url"));
    redirectUrl = PwdResetHelper.getAllowedRedirectUrl(redirectUrl, new SNC.PwdTrackingManager().getProcessIdByRequestId(requestId));
    gs.getSession().putProperty('pwd_redirect_url', redirectUrl);

    var uri = '$pwd_new.do?sysparm_id=' + userId + '&sysparm_request_id=' + requestId + '&sysparm_nostack=true&sysparm_token=' + token;
    if (redirectUrl && !PwdResetHelper._isAbsoluteUrl(redirectUrl)) {
	    uri = uri + '&pwd_redirect_url=' + redirectUrl;
    }  

    var resetPasswordURL = this.getInstanceURL() + '/nav_to.do?uri=' + encodeURIComponent(uri);
    if (GlideMobileExtensions.getDeviceType() == 'm' || GlideMobileExtensions.getDeviceType() == 'mobile') {
        gs.debug("Password Reset request coming in from a mobile device. Changing the URL to be mobile compatible");
        resetPasswordURL = this.getInstanceURL() + '/' + uri;
    }
    g_response.sendRedirect(resetPasswordURL);
}

function getInstanceURL() {
    var url = gs.getProperty("glide.servlet.uri");
    var overrideUrl = gs.getProperty("glide.email.override.url");
    url = overrideUrl ? overrideUrl : url;
    if (GlideStringUtil.nil(url)) {
        gs.log("glide.servlet.url or glide.email.override.url is empty!");
        return "";
    }
    url = url.trim();
    var len = url.length;
    if (url[len - 1] == '/')
        url = url.substring(0, len - 1);
    if (url.substring(len - 9, len) == "nav_to.do")
        url = url.substring(0, len - 10);

    return url;
}
