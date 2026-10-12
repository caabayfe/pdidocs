var SOWInteractionUtilsSNC = Class.create();
SOWInteractionUtilsSNC.prototype = {
    initialize: function() {
    },
	
	getTaskAggregationQuery: function(userSysId) {
		var numberOfDays = this.getNumberOfDays();
		var currentDateTime = new GlideDateTime();
		currentDateTime.addDaysLocalTime(-Math.abs(numberOfDays));
		var commonPart = '^sys_created_on>' + currentDateTime.getDate();
		var inc = "sys_class_name=incident^ref_incident.caller_id=" + userSysId + commonPart;
		var prb = "sys_class_name=problem^opened_by=" + userSysId + commonPart;
		var chg = "sys_class_name=change_request^ref_change_request.requested_by=" + userSysId + commonPart;
		var scr = "sys_class_name=sc_request^ref_sc_request.requested_for=" + userSysId + commonPart;
		
		var taskQuery = inc + "^NQ" + prb + "^NQ" + chg + "^NQ" + scr + "^ORDERBYDESCsys_created_on";
		return taskQuery;		
	},

	getNumberOfDays: function(){
		var numberOfDays = gs.getProperty('sn_sow_interaction.requester_info_task_query_day_range');
		return numberOfDays;
	},

    type: 'SOWInteractionUtilsSNC'
};
