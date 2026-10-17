var CMDBWsInsightClientUtil = Class.create();
CMDBWsInsightClientUtil.prototype = {
    initialize: function() {
    },

    getCloudFilters: function() {
        if (gs.hasRole('sn_cmdb_admin')) {
            return new sn_cmdb_ws.CMDBWsInsightUtil().getCloudFilters(true);
        }
    },

    getNonCloudFilters: function() {
        if (gs.hasRole('sn_cmdb_admin')) {
            return new sn_cmdb_ws.CMDBWsInsightUtil().getNonCloudFilters(true);
        }
    },

    type: 'CMDBWsInsightClientUtil'
};
