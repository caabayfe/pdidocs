(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var table_name = request.queryParams.table_name;
    var record_sys_id = request.queryParams.record_sys_id;
    var doc_sys_id = request.queryParams.doc_sys_id;
    if (!doc_sys_id || !record_sys_id || !table_name)
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('table_name, record_sys_id and doc_sys_id are required query parameters');

    var grRefDoc = new GlideRecordSecure('ds_document_references');
    grRefDoc.addQuery('table_name', table_name[0]);
    grRefDoc.addQuery('target_record', record_sys_id[0]);
    grRefDoc.addQuery('document', doc_sys_id[0]);
    grRefDoc.query();

    if (grRefDoc.next() && grRefDoc.canDelete()) {
        grRefDoc.deleteRecord();
        response.setStatus(204);
    } else {
        response.setStatus(500);
    }

})(request, response);
