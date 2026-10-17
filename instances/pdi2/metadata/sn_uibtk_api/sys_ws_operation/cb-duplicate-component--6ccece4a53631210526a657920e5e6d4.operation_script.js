(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const {
			fields,
			sysId
		} = request.body.data;
        if (!sysId) {
            apiHelper.respondSuccesfully([]);
        }
        const result = new ComponentBuilderMetadata().duplicateComponent(sysId, fields);
        apiHelper.respondSuccesfully(result);
    });
	
})(request, response);
