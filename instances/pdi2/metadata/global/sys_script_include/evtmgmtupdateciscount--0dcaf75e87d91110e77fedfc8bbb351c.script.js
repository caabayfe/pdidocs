gs.include('EvtMgmtCommons');
var EvtMgmtUpdateCisCount = Class.create();
EvtMgmtUpdateCisCount.prototype = {
    initialize: function() {
        this.evtMgmtCommons = new EvtMgmtCommons();
        this.CMDB_CI = "cmdb_ci";
    },

    execute: function() {
        var count = this.getCmdbCiTableSizeEstimate();
        if (count >= 0) {
            //Update "cis_count" hash with value
            this.evtMgmtCommons.setHashGr("cis_count", count);
        }
    },

    getCmdbCiTableSizeEstimate: function() {
        var impactManager = new SNC.ImpactManager();
        var rowCount = impactManager.getCmdbCiEstimatedCount();

        if (rowCount < 0) { // fallback to exact row count
            rowCount = this.getCmdbCiTableSize();
        }
        return rowCount;
    },

    getCmdbCiTableSize: function() {
        var gr = new GlideAggregate(this.CMDB_CI);
        gr.addAggregate('COUNT');
        gr.setCategory("list"); //routing query to read replica
        gr.query();
        if (gr.next()) {
            return gr.getAggregate('COUNT');
        }
        return -1;
    },

    type: 'EvtMgmtUpdateCisCount'
};
