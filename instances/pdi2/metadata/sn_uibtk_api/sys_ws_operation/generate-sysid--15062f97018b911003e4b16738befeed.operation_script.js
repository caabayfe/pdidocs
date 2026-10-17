(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const totalIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.TOTAL, null);
        if (totalIds) {
			const ids = [];
			for(let count = 0; count < totalIds; count++){
				ids.push(gs.generateGUID());
			}
            apiHelper.respondSuccesfully({
                sysIds: ids
            });
        } else {
            apiHelper.respondSuccesfully({
                sysId: gs.generateGUID()
            });
        }
    });

})(request, response);
