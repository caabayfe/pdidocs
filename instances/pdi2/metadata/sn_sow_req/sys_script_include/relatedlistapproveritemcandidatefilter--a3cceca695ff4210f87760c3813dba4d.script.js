var RelatedListApproverItemCandidateFilter = Class.create();
RelatedListApproverItemCandidateFilter.prototype = {
    initialize: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName) {
        this.tableName = tableName;
        this.parentFieldName = parentFieldName;
        this.parentRecordSysId = parentRecordSysId;
        this.referencedFieldName = referencedFieldName;
    },

    getFilterQuery: function() {
        var gr = new GlideRecordSecure(this.tableName);
        gr.addUserQuery(this.parentFieldName, this.parentRecordSysId);
        gr.query();

        var result = [];

        while (gr.next()) {
            result.push(gr.getValue(this.referencedFieldName));
        }

        return "sys_idNOT IN" + result.join(",") + "^active=true";
    },

    handles: function(thing) {
        return thing == "APPROVER_QUERY_FILTER";
    },

    type: 'RelatedListApproverItemCandidateFilter'
};
