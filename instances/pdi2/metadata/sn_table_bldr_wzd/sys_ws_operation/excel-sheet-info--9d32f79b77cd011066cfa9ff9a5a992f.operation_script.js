(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var options = TBWUtil.assign({},
        request.pathParams,
        TBWUtil.normalizeQueryParams(request.queryParams)
    );
    var apiResponse = new TBWSheetAPI(options.attachmentId).build();
	
	
		
    response.setBody(apiResponse);

})(request, response);
