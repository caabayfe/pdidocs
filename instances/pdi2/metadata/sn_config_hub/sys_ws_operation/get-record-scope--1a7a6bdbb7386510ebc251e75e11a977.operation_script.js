(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var table = request.pathParams.table;
    var recordId = request.pathParams.recordId;

    var glideRecord = new GlideRecord(table);
    
    if (!glideRecord || !glideRecord.get(recordId))
        return {};

    result = {
        table: table,
        recordId: recordId,
        scopeId: glideRecord.getValue('sys_package')
    };

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
