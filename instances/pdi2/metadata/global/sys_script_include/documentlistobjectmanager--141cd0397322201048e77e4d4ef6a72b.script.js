var DocumentListObjectManager = Class.create();
DocumentListObjectManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    proceedWithDeleteFromForm: function() {
        var documentListSysId = this.getParameter('sysparm_document_sys_id');
        this.deleteDocumentList(documentListSysId);
        return true;
    },
    proceedWithDeleteFromList: function() {
        var documentSysIds = this.getParameter('sysparm_document_sys_id_list');
        var documentSysIdList = documentSysIds.split(',');
        for (var i = 0; i < documentSysIdList.length; i++) {
            if (documentSysIdList[i] == null || documentSysIdList[i] == '')
                continue;
            this.deleteDocumentList(documentSysIdList[i]);
        }
        return true;
    },
    deleteDocumentList: function(documentSysId) {
        var documentRecord = new GlideRecord('ds_document_lists');
        documentRecord.get(documentSysId);
        if (documentRecord.canDelete()) {
            documentRecord.deleteRecord();
        }
    },
    toString: function() {
        return 'DocumentListObjectManager';
    }
});
