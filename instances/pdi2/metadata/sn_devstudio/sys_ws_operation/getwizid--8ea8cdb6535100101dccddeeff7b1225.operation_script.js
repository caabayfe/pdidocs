(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var wizId = new GlideappWizardIntercept(request.queryParams.path).get();
    response.setBody({'wizId' : wizId});
	
    return;

})(request, response);
