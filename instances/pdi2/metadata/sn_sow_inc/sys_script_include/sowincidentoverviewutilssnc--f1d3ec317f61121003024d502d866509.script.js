var SOWIncidentOverviewUtilsSNC = Class.create();
SOWIncidentOverviewUtilsSNC.prototype = {
    TABLES: {
        TASK_CI: "task_ci",
        TASK_CMDB_CI_SERVICE: "task_cmdb_ci_service"
    },

    initialize: function() {},

    getAffectedCICount: function(sysId) {
        var query = "task=" + sysId;
        return this.getCount(this.TABLES.TASK_CI, query);
    },

    getImpactedCICount: function(sysId) {
        var query = "task=" + sysId;
        return this.getCount(this.TABLES.TASK_CMDB_CI_SERVICE, query);
    },

    getAssetCount: function(sysId) {
        var query = "task=" + sysId + "^ci_item.assetISNOTEMPTY";
        return this.getCount(this.TABLES.TASK_CI, query);
    },

    getCount: function(table, query) {
        var ga = new GlideAggregate(table);
        ga.addEncodedQuery(query, true);
        ga.addAggregate('COUNT');
        ga.query();
        if (ga.next())
            return parseInt(ga.getAggregate('COUNT'));

        return 0;
    },

    type: 'SOWIncidentOverviewUtilsSNC'
};
