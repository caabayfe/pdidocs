var RelatedListCIItemCandidateFilter = Class.create();
RelatedListCIItemCandidateFilter.prototype = {
    initialize: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName) {
        this.tableName = tableName;
        this.parentFieldName = parentFieldName;
        this.parentRecordSysId = parentRecordSysId;
        this.referencedFieldName = referencedFieldName;
    },

    getFilterQuery: function() {
        var selectedRecord = new GlideRecordSecure(this.tableName);
        selectedRecord.addUserQuery(this.parentFieldName, this.parentRecordSysId);
        selectedRecord.query();
        var result = [];
        var query = "";
        while (selectedRecord.next()) {
            result.push(selectedRecord.getValue(this.referencedFieldName));
        }
        if (result.length)
            query = "sys_idNOT IN" + result.join(",");
        var configItemFilterQuery = new AssociateCIToTask().getQueryFilter(this.parentRecordSysId, this.tableName);
        if (configItemFilterQuery)
            query = query + '^' + configItemFilterQuery;
        return query;
    },

    getReferenceFieldValue: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName, showRefField) {
        if (!showRefField)
            return null;
        //By default when no entries we would show up cmdb_ci
        var classInfo = this.getLatestClass(tableName, parentFieldName, parentRecordSysId);
        if (!classInfo)
            classInfo = this.getParentClass(parentRecordSysId);

        return classInfo || this.getDefaultClass('cmdb_ci');
    },

    /*
     * If "Change Management - Mass Update CI" plugin is active and task type is change_requests
     *     parent class = ci_class populated on the change_request
     *     if --None- is selected for ci_class, then cmdb_ci is returned
     * else
     *     parent class = cmdb_ci
     **/
    getParentClass: function(chgReqId) {

        if (GlidePluginManager.isActive("com.snc.bestpractice.bulkchange") || GlidePluginManager.isActive("com.snc.change_management.mass_update_ci")) {
            var chgReqGR = new GlideRecordSecure("change_request");
            if (chgReqGR.get(chgReqId) && !chgReqGR.ci_class.nil()) {
                if (!chgReqGR.isValidField("is_bulk") || (chgReqGR.isValidField("is_bulk") && chgReqGR.getValue("is_bulk") === "1")) {
                    return {
                        refFieldValue: chgReqGR.getValue('ci_class'),
                        refFieldDisplayValue: chgReqGR.getDisplayValue('ci_class')
                    };
                }
            }
        }
        return null;
    },

    getLatestClass: function(tableName, parentFieldName, parentRecordSysId) {
        var affectedCiGR = new GlideRecordSecure(tableName);
        affectedCiGR.addQuery(parentFieldName, parentRecordSysId);
        affectedCiGR.orderByDesc("sys_updated_on");
        affectedCiGR.setLimit(1);
        affectedCiGR.query();
        if (affectedCiGR.next()) {
            if (affectedCiGR[this.referencedFieldName].nil())
                return null;
            var field = affectedCiGR[this.referencedFieldName].sys_class_name;
            return {
                refFieldValue: field.getValue(),
                refFieldDisplayValue: field.getDisplayValue()
            };
        }

        return null;
    },

    getDefaultClass: function(table) {
        var defaultClass = sys_meta["cmdb_ci"]["sys_meta"].label;
        return {
            refFieldValue: "cmdb_ci",
            refFieldDisplayValue: defaultClass
        };
    },

    handles: function(thing) {
        return thing == "CMDB_CI_QUERY_FILTER";
    },

    type: 'RelatedListCIItemCandidateFilter'
};
