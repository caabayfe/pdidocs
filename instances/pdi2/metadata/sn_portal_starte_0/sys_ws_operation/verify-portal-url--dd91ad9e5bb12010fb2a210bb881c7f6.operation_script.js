(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var newApplicationPath = request.pathParams.application_path;
        if (!newApplicationPath)
            return new sn_ws_err.BadRequestError('Application path not provided');
		var path = gs.base64Decode(newApplicationPath);
        var gr = new GlideRecord("sys_ux_page_registry");
        gr.addQuery("path", path);
        gr.query();
		
        var result = {
            isUnique: !gr.next(),
			path: path
        };
        response.setStatus(200);
        response.setBody(result);
    } catch (e) {
        var error = new sn_ws_err.ServiceError();
        error.setMessage(e.toString());
        response.setError(error);
    }
})(request, response);
