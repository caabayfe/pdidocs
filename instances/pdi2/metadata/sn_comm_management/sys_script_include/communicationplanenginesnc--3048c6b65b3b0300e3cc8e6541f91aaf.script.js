var CommunicationPlanEngineSNC = Class.create();

// Cache automatically clears on any update on comm_plan_definition records create/update/delete (sys_scoped_cache_table_pair.do?sys_id=8df486fb479bea105162fb41516d4359)
CommunicationPlanEngineSNC.COM_PLAN_DEF_TABLES_CACHE = "sn_comm_management.comm_plan_def_tables_cache";


CommunicationPlanEngineSNC.prototype = {

    TABLES: {
        COMM_PLAN_DEFINITION: "comm_plan_definition"
    },

    COLUMNS: {
        TABLE: "table",
        CONDITION_BASED: "condition_based"
    },

    initialize: function(sourceRecord, commPlanDefinitionRecord) {
        this.sourceRecord = sourceRecord;
        this.commPlanDefinitionRecord = commPlanDefinitionRecord;
    },

    attachPlans: function() {
        var bridge = new CommunicationManagementBridgeSNC();
        var handlerInstance = bridge.getHandlerInstance(this.sourceRecord.getRecordClassName());
        handlerInstance.attachPlans(this.sourceRecord, this.commPlanDefinitionRecord);
    },

    _buildTableKey: function(table, domain) {
        if (!domain)
            domain = 'global';

        return table + "_" + domain;
    },

    canRun: function() {

        var key = this._buildTableKey(this.sourceRecord.getRecordClassName(), this.sourceRecord.getValue("sys_domain"));

        var canRunCacheValue = sn_scoped_cache.ScopedCacheManager.get(sn_comm_management.CommunicationPlanEngineSNC.COM_PLAN_DEF_TABLES_CACHE, key);

        if (canRunCacheValue === null) {
            var gr = new GlideRecord(this.TABLES.COMM_PLAN_DEFINITION);
            gr.addActiveQuery();
            gr.addQuery(this.COLUMNS.TABLE, this.sourceRecord.getRecordClassName());
            gr.addQuery(this.COLUMNS.CONDITION_BASED, true);
            gr.setLimit(1);
            gr.query();
            canRunCacheValue = gr.hasNext() + '';
            sn_scoped_cache.ScopedCacheManager.put(sn_comm_management.CommunicationPlanEngineSNC.COM_PLAN_DEF_TABLES_CACHE, key, canRunCacheValue);
        }
        return canRunCacheValue === 'true';
    },

    type: 'CommunicationPlanEngineSNC'
};
