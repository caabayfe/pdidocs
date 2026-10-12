(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const scopeIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SCOPE_IDS, false);
        const templateIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.TEMPLATE_IDS, false);
		const scopeQuery = scopeIds ? `^sys_scope.${BuilderToolkitConstants.SYS_ID_IN}${scopeIds}` : '';
		const templateQuery = templateIds ? `^NQ${BuilderToolkitConstants.SYS_ID_IN}${templateIds}` : '';
		const encodedQuery = `${BuilderToolkitConstants.ASSOCIATED_TYPE_QUERY}${scopeQuery}${templateQuery}`;
		const queryResult = new UIBTemplate().getRecordsByQuery(encodedQuery);
        apiHelper.respondSuccesfully(queryResult);
	});

})(request, response);
