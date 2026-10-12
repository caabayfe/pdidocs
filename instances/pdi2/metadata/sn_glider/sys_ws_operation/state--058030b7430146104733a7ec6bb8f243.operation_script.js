(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var files = [];
	
    try {
        var requestBody = request.body.data;

        if (requestBody === null || requestBody === undefined || JSON.stringify(requestBody) === '{}') {
            var info = new sn_ws_err.BadRequestError(`Request body is empty, expected "uris" object`);
            return response.setBody(info);
        }

        var dirUris = requestBody['uris'];

        if (dirUris === undefined) {
            var err = new sn_ws_err.BadRequestError(`Invalid request body payload, expected "uris" object`);
            return response.setError(err);
        }

        for (var i = 0; i < dirUris.length; i++)
			files = files.concat(new sn_glider.SyncUtil().getDirectoryStat(dirUris[i]));

        var resObj = {
            timeStamp: Date.now(),
            files: files,
        };

        response.setStatus(200);
        response.setBody(resObj);
    } catch (err) {
        var exp = new sn_ws_err.BadRequestError(err.message);
        response.setError(exp);
    }
})(request, response);
