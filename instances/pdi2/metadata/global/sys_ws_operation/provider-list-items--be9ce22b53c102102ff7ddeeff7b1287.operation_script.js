(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var providerId = request.pathParams.provider_id;
    var pageSize = request.queryParams.pageSize;
    var searchQuery = request.queryParams.query;

    if (pageSize) {
        pageSize = pageSize[0];
    }
    pageSize = getPageSize(pageSize);
    var pageToken = request.queryParams.pageToken;
    if (pageToken) {
        pageToken = pageToken[0];
    }
    var folderId = request.queryParams.folderId;
    if (folderId) {
        folderId = folderId[0];
    }
    if (searchQuery)
        searchQuery = searchQuery[0];

    var inputs = {
        providerDetailSysId: providerId,
        pageSize: pageSize,
        pageToken: pageToken,
        folderId: folderId,
        searchQuery: searchQuery
    };

    try {
        var multiProviderAPI = new global.MultiProviderDocumentsAPI();
        var results = multiProviderAPI.getPaginatedFilesAndFolders(inputs);
        var statusCode = multiProviderAPI.getValidStatusCode(results.status_code, results.status);
        var responseBody;
        if (results.status && results.status.toLowerCase() === "success") {
            responseBody = {
                status: results.status.toLowerCase(),
                files: results.files,
                count: results.count,
                pageToken: (results.pageToken && results.pageToken !== '') ? results.pageToken : null
            };
        } else {
            responseBody = {
                status: (results.status ? results.status.toLowerCase() : "error"),
                message: results.error_message || "Unknown error"
            };
        }
        response.setStatus(statusCode);
        response.setBody(responseBody);
    } catch (err) {
        gs.error("Provider - List Items " + err);
        response.setStatus(500);
        response.setBody({
            status: "error",
            message: "Unexpected server error"
        });
    }

    function getPageSize(pageSize) {
        if (!pageSize || isNaN(pageSize) || parseInt(pageSize) < 1) {
            return 1;
        }
        if (parseInt(pageSize) >= 1000) {
            pageSize = 999;
        }
        return pageSize;
    }
})(request, response);
