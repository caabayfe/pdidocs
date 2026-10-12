(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var themeSysId = request.pathParams.themeSysId;
	return new sn_mobile_theme.MobileThemeColorAPI().getWebColorVariablesByThemeId(themeSysId);

})(request, response);
