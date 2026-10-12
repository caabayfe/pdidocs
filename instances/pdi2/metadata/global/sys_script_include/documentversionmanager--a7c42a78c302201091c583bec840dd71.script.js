var DocumentVersionManager = Class.create();
DocumentVersionManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    proceedWithDeleteFromForm: function() {
        var documentVersionSysId = this.getParameter('sysparm_document_version_sys_id');
        this.deleteDocumentVersion(documentVersionSysId);
        return true;
    },

    proceedWithDeleteFromList: function() {
        var documentVersionSysIds = this.getParameter('sysparm_document_version_sys_id_list');
        var documentVersionSysIdList = documentVersionSysIds.split(',');
        for (var i = 0; i < documentVersionSysIdList.length; i++) {
            if (documentVersionSysIdList[i] == null || documentVersionSysIdList[i] == '')
                continue;

            this.deleteDocumentVersion(documentVersionSysIdList[i]);
        }
        return true;
    },

    deleteDocumentVersion: function(documentVersionSysId) {
        var documentVersionRecord = new GlideRecordSecure('ds_document_version');
        documentVersionRecord.get(documentVersionSysId);
        if (documentVersionRecord.canDelete()) {
            var attachmentRecord = documentVersionRecord.attachment.getRefRecord();
            if (attachmentRecord.getUniqueValue()) {
                if (attachmentRecord.canDelete())
                    attachmentRecord.deleteRecord();
            }
            documentVersionRecord.deleteRecord();
        }
    },
    toString: function() {
        return 'DocumentVersionManager';
    }
});
