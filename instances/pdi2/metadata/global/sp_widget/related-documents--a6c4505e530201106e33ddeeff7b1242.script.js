(function() {

    data.sys_id = options.record_id || $sp.getParameter("sys_id");
    data.table = options.record_table || $sp.getParameter("table");
    data.title = options.title || input.title || gs.getMessage("Documents");
    data.metadata_form_view = options.metadata_form_view || input.metadata_form_view || 'dw';
    data.popup_before_upload = options.popup_before_upload || input.popup_before_upload;
    data.appendToId = options.appendToId;
    data.table = _getActualTable(data.table, data.sys_id);
    data.largeAttachmentMsg = gs.getMessage("Single file size limit is 100 MB. Please select again and upload.");
    data.uploadFileLimitMessage = gs.getMessage("Up to 10 files can be uploaded at once.");
    data.attachmentSuccessMsg = gs.getMessage("Attachment successfully uploaded");
    data.noDragDropMsg = gs.getMessage("Attachment drap-and-drop not enabled - use attachment button");
    data.dropFilesMsg = gs.getMessage("Drop files here");
    data.noAttachmentsMsg = gs.getMessage("There are no attachments");
    data.uploadPopupTitle = gs.getMessage("Fill document details");
    data.uploadButtonTitle = gs.getMessage("Upload");
    data.cancelButtonTitle = gs.getMessage("Cancel");
    data.editMetadataPopupTitle = gs.getMessage("Edit document details");
    data.deleteDocumentMsg = gs.getMessage("Are you sure you want to delete this document?");
    data.failedDownloadDocumentMsg = gs.getMessage("Downloading the documents has failed because either the document has no versions or the default version has URL as the file type.");
    data.folderNotSupportedMsg = gs.getMessage("Folder upload not supported");
    data.deleteTooltip = gs.getMessage("Delete");
    data.editTooltip = gs.getMessage("Edit Document");
    data.deleteMsg = gs.getMessage("Document Deleted");
    data.uploadMsg = gs.getMessage("Document(s) Uploaded");
    data.docCreationNotComplete = gs.getMessage("Document creation process is not complete");
    data.maxAttachmentSize = 100; // 100MB


    if (!data.table || !data.sys_id)
        return;

    var gr = new GlideRecord(data.table);
    if (!gr.isValid())
        return;

    if (!gr.get(data.sys_id))
        return;

    if (input && input.action == "delete") {
        var documentManager = new DocumentObjectManager();
        documentManager.deleteDocument(input.delete_sys_id);
    }

    if (input && input.action == "addDocument") {
        var documents = input.documents;
        var length = documents.length;
        var index = 0;

        var versions = [];
        while (index < length) {

            //creating a doc object
            var grDoc = new GlideRecord('ds_document');
            var fieldNames = Object.keys(documents[index]);
            fieldNames.forEach(function(prop) {
                grDoc[prop] = documents[index][prop];
            });
            var docSysId = grDoc.insert();

            var analyticsApi = new global.DocumentAnalyticsAPI();
            analyticsApi.sendData('Service Portal');

            index++;

            var verSysId = createVersionAndReference(docSysId);
            versions.push(verSysId);
        }

        data.versions = versions;
    }
    if (input && input.action == "addDocumentwithMetadata") {
        var createdDocSysId = input.docSysId;
        var verId = createVersionAndReference(createdDocSysId);
        data.versions = [verId];
        var analyticsApi = new global.DocumentAnalyticsAPI();
        analyticsApi.sendData('Service Portal');
    }

    if (input && input.action == "download") {

        var document = new GlideRecord('ds_document');
        document.get(input.download_sys_id);

        var download_version = document.getValue('default_version');
        var attachment = new GlideRecord('sys_attachment');
        attachment.addQuery('table_sys_id', download_version);
        attachment.query();

        if (attachment.next()) {
            gs.info(attachment.sys_id + ' related documents');
            data.version_attachment = attachment.getValue('sys_id');
        }
    }

    if (input && input.action == "deleted") {
        gr.comments = input.action + " an attachment";
        gr.update();
    }

    data.canWrite = gr.canWrite();
    data.canAttach = gs.hasRole(gs.getProperty("glide.attachment.role")) && GlideTableDescriptor.get(data.table).getED().getAttribute("no_attachment") != "true";
    data.canRead = gr.canRead();
    data.canDragAndDrop = gs.getProperty('glide.ui.attachment_drag_and_drop', 'true') === 'true';

    function createVersionAndReference(docSysId) {
        //creating ver record
        var grVer = new GlideRecord('ds_document_version');
        grVer.document = docSysId;
        var verSysId = grVer.insert();

        //creating ref for doc
        var grRefDoc = new GlideRecord('ds_document_references');
        grRefDoc.document = docSysId;
        grRefDoc.table_name = data.table;
        grRefDoc.target_record = data.sys_id;
        grRefDoc.insert();

        return verSysId;
    }

    function _getActualTable(table, id) {
        if (!table)
            return table;

        var rec = new GlideRecord(table);
        if (!rec.isValid())
            return table;

        if (rec.get(id) && rec.getValue('sys_class_name')) {
            return rec.getValue('sys_class_name');
        }
        return table;
    }

})();
