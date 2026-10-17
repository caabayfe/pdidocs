(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var requestBody = (request.body && request.body.data) || {};
    var recordIds = requestBody.recordIds;
    var table = requestBody.table;

    if (!Array.isArray(recordIds) || recordIds.length === 0) {
        response.setStatus(400);
        return { error: 'Missing or invalid recordIds parameter. Expected a non-empty array of sys_ids.' };
    }

    if (!table || typeof table !== 'string') {
        response.setStatus(400);
        return { error: 'Missing or invalid table parameter. Expected a valid table name string.' };
    }

    var fetcher = new sn_now_list_common.ListAIRecordActivityDataFetcher();
    var result = fetcher.get(recordIds, table);

    return { result: result };
})(request, response);
