(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const {appId} = request.queryParams;
	if(!appId) return response.setError(new sn_ws_err.BadRequestError('Missing required appId parameter.'));
	const app = appId[0];
	if(!app) return response.setError(new sn_ws_err.BadRequestError('Missing required appId parameter.'));
	
	const utils = new UXAApplicationUtils();
	return utils.getMenuForApp(app);

})(request, response);
