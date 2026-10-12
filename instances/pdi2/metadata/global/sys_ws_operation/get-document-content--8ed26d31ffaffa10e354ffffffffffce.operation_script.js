(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var documentSysId = request.pathParams.document_sys_id;

    if (!GlideStringUtil.isEligibleSysID(documentSysId)) {
        gs.warn('GetDocumentContent: invalid document_sys_id=' + documentSysId);
        response.setStatus(400);
        response.setContentType('application/json');
        response.getStreamWriter().writeString(JSON.stringify({
            error: {
                message: "Invalid document sys_id"
            }
        }));
        return;
    }

    var doc = new GlideRecordSecure('ds_document');
    if (!doc.get(documentSysId)) {
        gs.warn('GetDocumentContent: document not found for sys_id=' + documentSysId);
        response.setStatus(404);
        response.setContentType('application/json');
        response.getStreamWriter().writeString(JSON.stringify({
            error: {
                message: "Document not found"
            }
        }));
        return;
    }

    var versionSysId = doc.getValue('default_version');

    if (!versionSysId) {
        gs.warn('GetDocumentContent: no default_version for document sys_id=' + documentSysId);
        response.setStatus(409);
        response.setContentType('application/json');
        response.getStreamWriter().writeString(JSON.stringify({
            error: {
                message: 'Document does not have a default version'
            }
        }));
        return;
    }

    var att = new GlideRecordSecure('sys_attachment');
    att.addQuery('table_name', 'ds_document_version');
    att.addQuery('table_sys_id', versionSysId);
    att.setLimit(1);
    att.query();

    if (!att.next()) {
        gs.warn('GetDocumentContent: attachment missing for document version sys_id=' + versionSysId);
        response.setStatus(409);
        response.setContentType('application/json');
        response.getStreamWriter().writeString(JSON.stringify({
            error: {
                message: "Document version has no attachment"
            }
        }));
        return;
    }

    response.setStatus(200);
    var contentType = att.getValue('content_type') || 'application/octet-stream';
    response.setContentType(contentType);
    response.setHeader('X-Content-Type-Options', 'nosniff');

    var rawName = att.getValue('file_name') || 'download';
    var safeName = rawName.replace(/["\\\r\n]/g, '_');

    response.setHeader(
        "Content-Disposition",
        'attachment; filename="' + safeName + '"'
    );

    var size = att.getValue('size_bytes');
    if (size)
        response.setHeader('Content-Length', size);

    var writer = response.getStreamWriter();

    var gsa = new GlideSysAttachment();
    var inputStream = gsa.getContentStream(att.getUniqueValue());

    writer.writeStream(inputStream);
    inputStream.close();

})(request, response);
