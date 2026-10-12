var CriticalUpdatesConstants = Class.create();
CriticalUpdatesConstants.prototype = {
    initialize: function() {},
    type: 'CriticalUpdatesConstants'
};

CriticalUpdatesConstants.TIMELINE_EVENTS = {
    EVENTS: {
        DUE_SOON: 'Due soon',
        OVERDUE: 'Overdue'
    },
    EVENTS_COLOR: {
        DUE_SOON: '#E2D859',
        OVERDUE: '#E42338'
    }
};

CriticalUpdatesConstants.TABLE_CONSTANTS = {
	TABLE : "sn_critical_update"
};

CriticalUpdatesConstants.UPDATES_VIEW = {
	HIGHLIGHTED_CONFIG : {
		"not_due_soon" : "info",
		"overdue" : "critical",
		"due_soon" : "yellow"
	},
	ALL_UPDATES_CONFIG : {
		"availableUpdates" : [],
		"overDueUpdates" : [],
		"dueSoonUpdates" : [],
		"inProgressUpdates" : [],
		"acknowledgeCompleteUpdates" : [],
		"tabSetsConfig" : []
	},
	ENCODED_QUERIES_WITH_LABELS : [
		{
			"label_for_tabs" : gs.getMessage("Available"),
			"label_for_data_key" : "availableUpdates",
			"query" : "up_active=true^up_update_status!=acknowledged"
		},
		{
			"label_for_tabs" : gs.getMessage("Overdue"),
			"label_for_data_key" : "overDueUpdates",
			"query" : "up_update_priority=overdue^up_active=true"
		},
		{
			"label_for_tabs" : gs.getMessage("Due soon"),
			"label_for_data_key" : "dueSoonUpdates",
			"query" : "up_update_priority=due_soon^up_active=true"
		},
		{
			"label_for_tabs" : gs.getMessage("In progress"),
			"label_for_data_key" : "inProgressUpdates",
			"query" : "up_update_status=work_in_progress^up_active=true"
		},
		{
			"label_for_tabs" : gs.getMessage("Complete"),
			"label_for_data_key" : "acknowledgeCompleteUpdates",
			"query" :"up_update_status=acknowledged^up_active=true"
		}
	]
};
CriticalUpdatesConstants.prototype.SC_ADMIN_ROLE = "sn_vsc.security_center_admin";
