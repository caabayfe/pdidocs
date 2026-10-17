var OnCallScheduleReportUtilsSNC = Class.create();
OnCallScheduleReportUtilsSNC.prototype = {
	initialize: function() {
        this.onCallCommon = new OnCallCommon();
    },
	
	getOnCallGroups: function() {
        return this.onCallCommon.getOnCallGroups();
    },
	
	type: 'OnCallScheduleReportUtilsSNC'
};
