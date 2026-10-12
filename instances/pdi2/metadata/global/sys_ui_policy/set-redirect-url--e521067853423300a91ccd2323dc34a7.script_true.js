function onCondition() {
    if (!g_form.isNewRecord())
        return;

    var ajax = new GlideAjax("AuthenticationHelper");
    ajax.addParam('sysparm_name', 'getInstanceURL');
    ajax.getXMLAnswer(processResponse);
}

function processResponse(response) {
    var url = response;
	if (url) {
        url += '/oauth_redirect.do';
    } else {
        url = g_navigation.getURL().split(/[/?]/);
        url = url[0] + '//' + url[2] + '/oauth_redirect.do';
    }
    g_form.setValue('redirect_url', url);
}
