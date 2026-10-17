(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

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

        response.setStatus(200);
        response.setHeader('Content-Type', 'application/json');
        var writer = response.getStreamWriter();
        writer.writeString(`{"timeStamp": ${Date.now()},"files":[`);
        var syncUtil = new sn_glider.SyncUtilV2();
        var wroteEntriesFromLastDir = false;
        for (var i = 0; i < dirUris.length; i++) {
            var gr = syncUtil.getDirectoryStatQuery(dirUris[i]);
            // Only write a separator when we wrote content from the last directory query and we have content to write for the next one.
            if (wroteEntriesFromLastDir && gr.hasNext()) {
                writer.writeString(',');
                wroteEntriesFromLastDir = false;
            }
            while (gr.next()) {
                writer.writeString(JSON.stringify(syncUtil._getFileIndexObj(gr)));
                wroteEntriesFromLastDir = true;
                if (gr.hasNext()) {
                    writer.writeString(',');
                }
            }
        }

        writer.writeString(']}');
    } catch (err) {
        var exp = new sn_ws_err.BadRequestError(err.message);
        response.setError(exp);
    }
})(request, response);
