var RelatedListItemCandidateFilter = Class.create();
RelatedListItemCandidateFilter.prototype = {
    getFilterQuery: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName) {
        var selectedRecord = new GlideRecordSecure(tableName);
        selectedRecord.addUserQuery(parentFieldName, parentRecordSysId)
        selectedRecord.query();
        var result = [];
        while (selectedRecord.next()) {
            result.push(selectedRecord.getValue(referencedFieldName));
        }

        if (result.length)
            return "sys_idNOT IN" + result.join(",");

        return "";
    },
	
    getReferenceFieldValue: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName, showRefField) {
        // leaving this empty by default
    },

    handles: function(extensionPointKey) {
        return extensionPointKey == "DEFAULT";
    },

    type: 'RelatedListItemCandidateFilter'
};
