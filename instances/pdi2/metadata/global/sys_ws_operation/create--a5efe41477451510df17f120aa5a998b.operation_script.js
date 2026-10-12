(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var body = request.body.data;
        var table_name = body.table_name;
        var record_sys_id = body.record_sys_id;
        var folder_sys_id = body.folder_sys_id;
        var docs = [];
        var results = {
            successful: [],
            failed: []
        };
        // For backward compatibility
        if (!body.documents) {
            var name = body.file_name;
            if (!name || !table_name || !record_sys_id) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(400)
                    .setMessage('record_sys_id, table_name and file_name are required.');
            }
            var grParentRec = new GlideRecordSecure(table_name);
            if (!grParentRec.get(record_sys_id)) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage('Record not found with sys_id: ' + record_sys_id + ' in table: ' + table_name);
            }
            var docObjectManager = new global.DocumentObjectManager();
            var recordAccess = docObjectManager.validateRecordAccess(table_name, record_sys_id);
            if (!recordAccess.valid) {
                response.setStatus(403);
                return;
            }
            var doc = {
                "file_name": name,
            };
            var docInfo = docObjectManager.createAndLinkDocument(doc, table_name, record_sys_id);
            response.setStatus(200);
            response.setBody(docInfo);
            return;
        }
        if (!Array.isArray(body.documents)) {
            throw new sn_ws_err.ServiceError()
                .setStatus(400)
                .setMessage('documents must be an array');
        }
        // Throws an error when the request body contains both record and folder info
        // Doesn't throw error when no info regarding record or folder is provided.
        if ((table_name && folder_sys_id) || (record_sys_id && folder_sys_id)) {
            throw new sn_ws_err.ServiceError()
                .setStatus(400)
                .setMessage('Either (table_name and record_sys_id) or folder_sys_id needed not both');
        }
        docs = body.documents;
        if (table_name && record_sys_id) {
            createAndLinkAllDocuments(docs, table_name, record_sys_id, results);
        } else if (folder_sys_id) {
            createAllDocumentsUnderFolder(docs, folder_sys_id, results);
        } else {
            // Creates a document without linking to any record or folder.
            createDocumentsWithVersion(docs, results);
        }
        response.setStatus(200);
        response.setBody(results);
    } catch (e) {
        var err;
        if (e instanceof sn_ws_err.ServiceError) {
            err = e;
        } else {
            err = new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage('Unexpected server error: ' + e.message);
        }
        throw err;
    }
})(request, response);

function createDocumentsWithVersion(docs, results) {
    var docObjectManager = new global.DocumentObjectManager();
    docs.forEach(function(doc) {
        var docValidation = docObjectManager.validateDocumentObject(doc);
        if (!docValidation.valid) {
            results.failed.push({
                error: docValidation.error
            });
            return;
        }
        var docInfo = docObjectManager.createDocumentWithVersion(doc.file_name);
        results.successful.push(docInfo);
    });
}

function createAndLinkAllDocuments(docs, table_name, record_sys_id, results) {
    var docObjectManager = new global.DocumentObjectManager();
    var recordAccess = docObjectManager.validateRecordAccess(table_name, record_sys_id);
    if (!recordAccess.valid) {
        if (recordAccess.error.indexOf("Record not found") === 0) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(recordAccess.error);
        } else if (recordAccess.error.indexOf("Insufficient permissions") === 0) {
            throw new sn_ws_err.ServiceError()
                .setStatus(403)
                .setMessage(recordAccess.error);
        }
    }
    docs.forEach(function(doc) {
        var docValidation = docObjectManager.validateDocumentObject(doc);
        if (!docValidation.valid) {
            results.failed.push({
                error: docValidation.error
            });
            return;
        }
        var docInfo = docObjectManager.createAndLinkDocument(doc, table_name, record_sys_id);
        results.successful.push(docInfo);
    });
}

function createAllDocumentsUnderFolder(docs, folder_sys_id, results) {
    var docObjectManager = new global.DocumentObjectManager();
    var folderAccess = docObjectManager.validateFolderAccess(folder_sys_id);
    if (!folderAccess.valid) {
        if (folderAccess.error.indexOf("Folder not found") === 0) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(folderAccess.error);
        } else if (folderAccess.error.indexOf("Insufficient permissions") === 0) {
            throw new sn_ws_err.ServiceError()
                .setStatus(403)
                .setMessage(folderAccess.error);
        }
    }
    docs.forEach(function(doc) {
        var docValidation = docObjectManager.validateDocumentObject(doc);
        if (!docValidation.valid) {
            results.failed.push({
                error: docValidation.error
            });
            return;
        }
        var docInfo = docObjectManager.createDocumentUnderFolder(doc, folder_sys_id);
        results.successful.push(docInfo);
    });
}
