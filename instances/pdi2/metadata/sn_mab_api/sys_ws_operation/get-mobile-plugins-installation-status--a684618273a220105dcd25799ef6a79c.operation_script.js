(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var mobilePluginsInstallationStatusService = new MobilePluginsInstallationStatusService();
	return mobilePluginsInstallationStatusService.getPluginsInstallationStatus();
})(request, response);
