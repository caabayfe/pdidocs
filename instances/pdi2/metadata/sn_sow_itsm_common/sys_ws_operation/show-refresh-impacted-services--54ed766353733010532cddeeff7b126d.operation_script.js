(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
		return !!new global.CIUtils().canShowRefreshServicesUIAction(request.pathParams.table || '');
	} catch(err) {
		return false;
	}
})(request, response);
