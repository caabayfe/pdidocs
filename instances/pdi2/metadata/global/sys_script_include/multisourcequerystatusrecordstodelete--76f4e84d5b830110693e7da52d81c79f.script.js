var MultiSourceQueryStatusRecordsToDelete = Class.create();
MultiSourceQueryStatusRecordsToDelete.prototype = {
    initialize: function() {},
    getQueryExecutionIds: function() {
        var lastExecutionIds = [];
        var recordsToDelete = [];
        var queryIds = [];

        if (gs.hasRole('cmdb_ms_user')) {
            // Get all the query sys_ids
            var ga = new GlideAggregate('cmdb_multisource_query_status');
            ga.addAggregate('COUNT');
            ga.groupBy('query_id');
            ga.query();

            while (ga.next()) {
                queryIds.push(ga.getValue('query_id'));
            }

            // Get the latest execution_ids for the query sys_ids
            for (var i = 0; i < queryIds.length; i++) {
                var queryExecutionObj = JSON.parse(sn_cmdb.MultiSourceAnalytics.getLastExecution(queryIds[i]));
                lastExecutionIds.push(queryExecutionObj.executionId);
            }

            // Get the records to be deleted
            var gr = new GlideRecord('cmdb_multisource_query_status');
            gr.addQuery('sys_id', 'NOT IN', lastExecutionIds);
            gr.query();
            while (gr.next()) {
                recordsToDelete.push(gr.getValue('sys_id'));
            }
        }
        return recordsToDelete;
    },

    type: 'MultiSourceQueryStatusRecordsToDelete'
};
