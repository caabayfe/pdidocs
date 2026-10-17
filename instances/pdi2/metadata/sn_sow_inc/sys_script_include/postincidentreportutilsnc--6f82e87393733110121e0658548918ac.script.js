var PostIncidentReportUtilSNC = Class.create();
PostIncidentReportUtilSNC.prototype = {
    initialize: function() {
        this.constants = new PostIncidentReportConstants();
    },

    getIncidentRecord: function(incidentSysId) {
        var incGr = new GlideRecord(this.constants.INCIDENT.TABLE);
        incGr.addQuery(this.constants.SYS_ID, incidentSysId);
        incGr.query();
        return incGr;
    },

    getPirByIncidentSysId: function(incidentSysId) {
        var pirReviewGR = new GlideRecord(this.constants.POST_INCIDENT_REVIEW.TABLE);
        pirReviewGR.addQuery(this.constants.POST_INCIDENT_REVIEW.INCIDENT, incidentSysId);
        pirReviewGR.query();
        return pirReviewGR;
    },

    getDefaultAdminSettings: function(incidentSysId) {
        var adminConfigGr = new GlideRecord(this.constants.ADMIN_CONFIG.TABLE);
        adminConfigGr.addQuery(this.constants.ADMIN_CONFIG.RECORD_KEY, this.constants.ADMIN_CONFIG.TIMELINE_SETTINGS);
        adminConfigGr.query();
        if (adminConfigGr.next()) {
            return JSON.parse(adminConfigGr.getValue('value'));
        } else {
            return null;
        }
    },

    type: 'PostIncidentReportUtilSNC'
};
