(function executeRule(current, previous /*null when async*/ ) {

    if (current.type == 'url') {
        var regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        var url = current.url;
        if (!regex.test(url)) {
            gs.addErrorMessage(gs.getMessage('Invalid URL format. Please enter valid URL.'));
            current.setAbortAction(true);
            return;
        }
    }

    if (current.operation() === 'insert') {
        var documentSysId = current.document;
        var docGR = new GlideRecord("ds_document");

        if (!docGR.get(documentSysId)) {
            gs.addErrorMessage(gs.getMessage("Document record doesn't exist for the current version, hence aborting."));
            current.setAbortAction(true);
            return;
        }

        var defVerSysId = docGR.getValue('default_version');
        var isExternalDoc = docGR.external;

        var tableName = current.sys_class_name;
        var recordSysId = current.getUniqueValue();

        if (defVerSysId) {
            var currAttachment = new GlideSysAttachment().getAttachments(tableName, recordSysId);

            var currContentType = "";
            var currFileExt = "";

            if (currAttachment.next()) {
                var currFileName = currAttachment.getValue('file_name') || "";
                currFileExt = currFileName.split('.').pop();
                currContentType = currAttachment.getValue('content_type');
                gs.debug('Current Version file content type : ' + currContentType + ' for the document : ' + documentSysId);
            }

            var defVerContentType = "";
            var defVerFileExt = "";

            var defVerAttachment = new GlideSysAttachment().getAttachments(tableName, defVerSysId);

            if (defVerAttachment.next()) {
                var defVerFileName = defVerAttachment.getValue('file_name') || "";
                defVerFileExt = defVerFileName.split('.').pop();
                defVerContentType = defVerAttachment.getValue('content_type');
                gs.debug('Default Version content type : ' + defVerContentType + ' for the document : ' + documentSysId);
            } else if (isExternalDoc) {
                defVerFileExt = docGR.mp_document.document_name.split('.').pop();
            } else {
                gs.debug("Warning: Default version doesn't exist for the document.");
            }

            // Validate file extension consistency
            if (isExternalDoc && currFileExt && defVerFileExt && currFileExt !== defVerFileExt) {
                gs.addErrorMessage(gs.getMessage('File extension should be the same in all versions of the document.'));
                current.setAbortAction(true);
                return;
            }

            // Warn about inconsistent content types for internal documents
            if (!isExternalDoc && currFileExt && defVerFileExt && currContentType && defVerContentType) {
                if (currFileExt !== defVerFileExt || currContentType !== defVerContentType) {
                    gs.addInfoMessage(gs.getMessage('Warning: File extension and content type should be consistent across all document versions.'));
                }
            }
        }
        // Determine and set the new version number
        var versions = new GlideRecord(tableName);
        versions.addQuery("document", documentSysId);
        versions.orderByDesc("version_number");
        versions.setLimit(1);
        versions.query();

        current.version_number = versions.next() ? versions.version_number + 1 : 1;
    }
})(current, previous);
