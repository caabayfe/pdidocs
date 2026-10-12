var PerformanceIndicatorUtilSNC = Class.create();
PerformanceIndicatorUtilSNC.prototype = {
    initialize: function() {

    },

    postHotspot: function(stats) {
        var sessionDetails = gs.getSession();
        var debugStatus = sessionDetails.getClientData('debug_ec_portal');
        if (debugStatus === "true") {
            var portalPerfStatsMgr = new sn_ex_emp_fd.PortalPerformanceStatsManager();
            portalPerfStatsMgr.postStats(stats);
        }
    },

    postInstanceHotspot: function(stats) {
        stats.callerTable = 'sp_instance';
        stats.refTable = 'sp_instance';
        stats.refRecordId = stats.callerId;
        stats.userId = gs.getUserID();
        this.postHotspot(stats);
    },

    type: 'PerformanceIndicatorUtilSNC'
};
