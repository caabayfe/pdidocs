var EvtMgmtGroupingUtil = Class.create();
EvtMgmtGroupingUtil.prototype = {
    initialize: function() {
		this.IS_GROUPED_ALERT = 'true';
    },
	
	// THE FOLLOWING FUNCTION (getCreatedAlerts) IS DEPRECATED IN THIS FILE!
	// This function is in use in the "EvtMgmtAlertMgmtUtils" file that's belong to the Alert Management scoped app
	getCreatedAlerts: function(startTime, endTime, chunkSize) {
		//cover all the alerts between 2 group executions, in addition do not take the virtual
		//because it should handle in the update script.
        var openStates = ["Open", "Reopen", "Flapping"];
        var recentAlerts = new GlideRecord('em_alert');
        recentAlerts.addQuery('sys_created_on', '>', startTime);
        recentAlerts.addQuery('sys_created_on', '<=', endTime);
        recentAlerts.addQuery('state', 'IN', openStates);
		recentAlerts.addQuery('is_group_alert' , '!=' ,this.IS_GROUPED_ALERT);
        recentAlerts.setLimit(chunkSize);
        recentAlerts.orderBy('sys_created_on');
        recentAlerts.query();
        return recentAlerts;
    }, 
	
	// THE FOLLOWING FUNCTION (getUpdatedAlerts) IS DEPRECATED IN THIS FILE!
	// This function is in use in the "EvtMgmtAlertMgmtUtils" file that's belong to the Alert Management scoped app
	getUpdatedAlerts: function(startTime, endTime, chunkSize, groupingG2Time, waitForGrouping) {

        var openStates = ["Open", "Reopen", "Flapping"];
        var recentAlerts = new GlideRecord('em_alert');
        recentAlerts.addQuery('sys_updated_on', '>=', startTime);
        recentAlerts.addQuery('sys_updated_on', '<', endTime);
		
		//taking the the alerts after the grouping occur, and just the update. in addition taking the virtual
		//because it creates and update after the grouping time.
		if (waitForGrouping) {
			recentAlerts.addQuery('sys_created_on', '<=', groupingG2Time).addOrCondition('is_group_alert','=',this.IS_GROUPED_ALERT);
		}
		
		recentAlerts.addQuery('state', 'IN', openStates);
        recentAlerts.setLimit(chunkSize);
        recentAlerts.orderBy('sys_updated_on');
        recentAlerts.query();
        return recentAlerts;
    },
	
	setSuggestedRelationTypeFields: function(rec) {		
		var s = rec.relationship + '';
		var sa = s.split(':');
		rec.parent = (sa[0] == 'parent');
		rec.child = (sa[0] == 'child');
		rec.cmdb_rel_type = sa[1];
	},

    type: 'EvtMgmtGroupingUtil'
};
