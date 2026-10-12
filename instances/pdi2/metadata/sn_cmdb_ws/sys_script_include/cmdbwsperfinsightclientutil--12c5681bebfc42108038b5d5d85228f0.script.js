var CMDBWsPerfInsightClientUtil = Class.create();
CMDBWsPerfInsightClientUtil.prototype = {
    initialize: function() {
    },

    getIntegrationDatasourceSysIds: function() {
        if (gs.hasRole('sn_cmdb_admin')) {
            return new sn_cmdb_ws.CMDBWsPerfInsightsUtil().getIntegrationDataSourceSysIds();
        }
    },

    type: 'CMDBWsPerfInsightClientUtil'
};
