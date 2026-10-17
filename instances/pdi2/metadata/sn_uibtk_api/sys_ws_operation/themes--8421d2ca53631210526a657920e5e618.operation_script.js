(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const result = new UXTheme().getAllThemes();
        apiHelper.respondSuccesfully(result);
    });
	
})(request, response);
