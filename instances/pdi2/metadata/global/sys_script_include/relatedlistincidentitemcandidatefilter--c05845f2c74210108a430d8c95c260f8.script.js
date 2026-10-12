var RelatedListIncidentItemCandidateFilter = Class.create();
RelatedListIncidentItemCandidateFilter.prototype = {

    initialize: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName) {
        this.tableName = tableName;
        this.parentFieldName = parentFieldName;
        this.parentRecordSysId = parentRecordSysId;
        this.referencedFieldName = referencedFieldName;
    },

    getFilterQuery: function() {
        if (this.tableName !== "incident") return "";
        
        var gr = new GlideRecordSecure(this.tableName);
        gr.addUserQuery(this.parentFieldName, this.parentRecordSysId);
        gr.query();

        var result = [];
        result.push(this.parentRecordSysId);

        while (gr.next()) {
            result.push(gr.getUniqueValue());
        }

        return "sys_idNOT IN" + result.join(",") + "^active=true";
    },

    handles: function(thing) {
        return thing == "CHILD_INCIDENT_QUERY_FILTER";
    },

    type: 'RelatedListIncidentItemCandidateFilter'
};
