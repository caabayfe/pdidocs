(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var contents = [];
    var files = [];
    var URIS_STRING = 'uris';

    try {
        var requestBody = request.body.data;

        if (requestBody === null || requestBody === undefined || JSON.stringify(requestBody) === '{}') {
            var info = new sn_ws_err.BadRequestError(`Request body is empty, expected "${URIS_STRING}" object`);
            return response.setBody(info);
        }

        var fileUris = requestBody['uris'];

        if (fileUris === undefined) {
            var err = new sn_ws_err.ServiceError();
            err.setStatus(422);
            err.setMessage('Invalid request body payload');
            err.setDetail(`Expected "uris" array object in the request body payload`);

            return response.setError(err);
        }

        for (var i = 0; i < fileUris.length; i++) {
            var fileStat = new sn_glider.SyncUtil().getFileStat(fileUris[i]);

            if (fileStat.file)
                files.push(fileStat.file);

            if (fileStat.content)
                contents.push(fileStat.content);
        }

        var resObj = {
            timeStamp: Date.now(),
            files,
            contents
        };

        response.setStatus(200);
        response.setBody(resObj);
    } catch (err) {
        var exp = new sn_ws_err.BadRequestError(err.message);
        response.setError(exp);
    }
})(request, response);
