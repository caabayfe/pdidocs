(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var sys_id = request.body.data.sys_id;
    var table_name = request.body.data.table_name;
    if (!sys_id || !table_name) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('sys_id and table_name are required.');
    }
    var docRef = new GlideRecordSecure('ds_document_references');
    docRef.addQuery('table_name', table_name);
    docRef.addQuery('target_record', sys_id);
    docRef.orderByDesc('sys_created_on');
    docRef.query(); // filtering the doc ref table.
    var documents = [];
    while (docRef.next()) {
        var docTab = new GlideRecordSecure('ds_document');
        docTab.get(docRef.document);
        var attachment = new GlideRecordSecure('sys_attachment');
        attachment.addQuery('table_name', 'ds_document_version');
        attachment.addQuery('table_sys_id', docTab.default_version);
        attachment.query(); // filtering the attachments table.
        var default_version_size, default_attachment_sys_id;
        if (attachment.next()) {
            default_attachment_sys_id = attachment.sys_id;
            default_version_size = attachment.size_bytes;
        } else {
            default_attachment_sys_id = null;
            default_version_size = null;
        }
		var departmentName = docTab.department;
		if( departmentName != null && departmentName != 'undefined' )
			departmentName = docTab.department.name;
        if(!docTab.sys_id) 
            continue;
        documents.push({
            sys_id: docTab.sys_id,
            file_name: docTab.name,
            description: docTab.description,
            department: departmentName,
            canDelete: docTab.canDelete(),
            canRemoveRef: docRef.canDelete(),
            canWrite: docTab.canWrite(),
            size: default_version_size,
            file_type: docTab.default_version && docTab.default_version.type,
            url: docTab.default_version && docTab.default_version.url,
            default_version: docTab.default_version,
            default_attachment_sys_id: default_attachment_sys_id
        });
    }
    var body = {};
    body.documents = documents;
    response.setBody(body);

})(request, response);
