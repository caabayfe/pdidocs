(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var mobileThemeIds =  new sn_mobile_theme.MobileThemeColorAPI().getMobileThemeIds();
	try {
		return new MobileUXThemeService().getMobileUXThemes(mobileThemeIds);
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
