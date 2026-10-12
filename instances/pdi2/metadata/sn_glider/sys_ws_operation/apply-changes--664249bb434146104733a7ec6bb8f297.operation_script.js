(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var syncUtil = new sn_glider.SyncUtil();

    function readDataFromRequestBody() {
        var requestBody = request.body.data;
        if (requestBody === null || requestBody === undefined)
            return null;
        return requestBody;
    }
    var requestBodyData = readDataFromRequestBody();

    // remove flow
    if (requestBodyData.remove.length > 0) {
        for (var i = 0; i < requestBodyData.remove.length; i++) {
            try {
                var resp = syncUtil.purgeData(requestBodyData.remove[i]);
                setResponse(resp.statusCode, resp.body);
            } catch (err) {
                setResponse(500, {
                    status: err.message
                });
            }
        }
    } else {
        // Default content type (if we have an empty response)
        response.setContentType('text/plain');
    }

    var writeChanges = requestBodyData.create.concat(requestBodyData.update);
    for (var i = 0; i < writeChanges.length; i++) {
        var fileContent = requestBodyData.content.find(content => content.checksum === writeChanges[i].checksum);
        syncUtil.writeFile(writeChanges[i], fileContent);
    }

    function setResponse(statusCode, body) {
        response.setStatus(statusCode);
        if (body) {
            response.setContentType('application/json');
            response.setBody(body);
        } else {
            response.setContentType('text/plain');
        }
    }
})(request, response);
