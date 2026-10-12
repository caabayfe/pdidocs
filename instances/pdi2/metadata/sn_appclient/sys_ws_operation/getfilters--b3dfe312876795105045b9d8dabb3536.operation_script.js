(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {};
	var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var filterList = new  sn_appclient.AppManagerFiltersUtil().getFilters();
        appManagerApiUtil.setResponseBody(filterList);
        appManagerApiUtil.setHeader("Cache-Control", "max-age=3600");
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
	
})(request, response);
