var RelatedListConfigItemFilter = Class.create();
RelatedListConfigItemFilter.prototype = {
    initialize: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName) {
        this.tableName = tableName;
        this.parentFieldName = parentFieldName;
        this.parentRecordSysId = parentRecordSysId;
        this.referencedFieldName = referencedFieldName;
    },
    getFilterQuery: function() {
        //Get existing CIs related to business process
        var m2m = new GlideRecord(this.tableName);
        m2m.addQuery(this.parentFieldName, this.parentRecordSysId);
        m2m.query();
        var existingCIs = [];
        while (m2m.next()) {
            existingCIs.push(m2m.getValue(this.referencedFieldName));
        }
        //Get CIs with class business application 
        var cmdbCI = new GlideRecord(this.referencedFieldName);
        cmdbCI.addQuery('sys_id', 'NOT IN', existingCIs);
        cmdbCI.addQuery('sys_class_name', 'cmdb_ci_business_app');
        cmdbCI.query();
        var businessAppCIs = [];
        while (cmdbCI.next()) {
            businessAppCIs.push(cmdbCI.getUniqueValue());
        }

        if (businessAppCIs.length)
            return 'sys_idIN' + businessAppCIs.join(',');
        return 'sys_id=';
    },

    handles: function(thing) {
        return thing == "CONFIG_ITEM_FILTER";
    },

    type: 'RelatedListConfigItemFilter'
};
