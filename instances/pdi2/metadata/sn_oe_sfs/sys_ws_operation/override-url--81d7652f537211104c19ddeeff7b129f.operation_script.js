(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var clientType = request.pathParams.clientType;
    var app = request.pathParams.app;
	var externalId = request.pathParams.externalId;

	var returnUrl = decodeURIComponent(new global.ChannelProxyInstallURLGetter(clientType, app).getConfirmationURL(externalId));

    var sysProp = gs.getProperty('sn_va_slack.enable_slack_branding', 'false');
    var updateUrl = sysProp == 'false';
	
    if (updateUrl && returnUrl.indexOf(',chat:write.customize') >= 0) {
        var replaceText = ',chat:write.customize';
        returnUrl = returnUrl.replaceAll(replaceText, '');
    }

    return returnUrl;

})(request, response);
