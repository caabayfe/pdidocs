var MultisourceReports = Class.create();
MultisourceReports.prototype = {
    initialize: function() {},
    getLastExecutionId: function(savedQueryId) {
        var executionIdFromAPI = '';
        if (gs.hasRole('cmdb_ms_user')) {
            var executionStatus = sn_cmdb.MultiSourceAnalytics.getLastExecution(savedQueryId);
            var executionStatusObj = JSON.parse(executionStatus);
            if (executionStatusObj.valid == true) {
                executionIdFromAPI = executionStatusObj.executionId;
            }
        }
        return executionIdFromAPI;
    },
    type: 'MultisourceReports'
};
