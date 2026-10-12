var DocumentListEntryObjectManager = Class.create();
DocumentListEntryObjectManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {
     proceedWithDeleteFromForm: function() {
        var entrySysId = this.getParameter('sysparm_document_list_entry_sys_id');
        this.deleteDocumentListEntry(entrySysId);
        return true;
    },

    proceedWithDeleteFromList: function() {
        var entrySysIds = this.getParameter('sysparm_document_list_entry_sys_id_list');
        var entrySysIdList = entrySysIds.split(',');
        for (var i = 0; i < entrySysIdList.length; i++) {
            if (entrySysIdList[i] == null || entrySysIdList[i] == '')
                continue;

            this.deleteDocumentListEntry(entrySysIdList[i]);
        }
        return true;
    },

    deleteDocumentListEntry: function(entrySysId) {
        var entryRecord = new GlideRecord('ds_document_list_entry');
        entryRecord.get(entrySysId);
        if (entryRecord.canDelete()) {            
            entryRecord.deleteRecord();
        }
    },
    toString: function() {
        return 'DocumentListEntryObjectManager';
    }
});
