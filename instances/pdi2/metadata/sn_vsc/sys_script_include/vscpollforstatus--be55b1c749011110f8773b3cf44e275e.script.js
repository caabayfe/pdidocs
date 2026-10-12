var VscPollForStatus = Class.create();
VscPollForStatus.prototype = {
    initialize: function() {
    },
	
	getProcessStatus : function( payload, comparisonType ) {
		var timeBeforePolling = new Date().getTime();
		var pollConfig = new sn_vsc.SecurityCenterConstants().pollConfig[comparisonType];
		pollConfig["payload"] = payload;
		var status = this.statusCheck(pollConfig);
		while(status === pollConfig.comparison_progress_text) {
			var newTime = new Date().getTime();
			/* Only run a gliderecord query when it is past 0.5 seconds / 500 milliseconds */
			if(newTime >  timeBeforePolling + 500) {
				status = this.statusCheck(pollConfig);			
			}
		} 
		
		/* Not necessary to return anything, but to make it more clear and understandable. */
		return pollConfig.comparison_completed_text;
	},
	
	statusCheck : function(config) {
		var gr_comparisons = new GlideRecord(config.tableName);
		var dateRange = config.payload;
		gr_comparisons.addQuery(config.columnForComparisonValueCheck, dateRange);
		gr_comparisons.query();
		if (gr_comparisons.next()) {
			if (config.tableName  == "sn_vsc_user_comparisons"){
				return gr_comparisons.usr_status.toString();
			} else {
				return gr_comparisons.scn_status.toString();
			}
		}
	},

    type: 'VscPollForStatus'
};
