var IncidentCommunicationParticipants = Class.create();
IncidentCommunicationParticipants.prototype = {
	TABLE_INCIDENT_ALERT: 'incident_alert',
	TABLE_INCIDENT_ALERT_TASK: 'incident_alert_task',

	ACTION: {
		SELF_JOIN: 'selfJoin'
	},

    initialize: function() {
    },
	
	getContacts: function (inputData, previousContacts, type) {
		return [];
	},
	
	getGroupDetails: function (groupId, inputData, alreadyGotGroupDetails, type) {
	},
	
	isConferenceLeader: function (srcGr, /* optional */ userId) {
		if (!srcGr.instanceOf(this.TABLE_INCIDENT_ALERT) && !srcGr.instanceOf(this.TABLE_INCIDENT_ALERT_TASK))
			return;
		return new IncidentAlertNotifyUtils().isConferenceLeader(srcGr, userId);
	},

	getNotifyNumber: function (sourceGr) {
		var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance('incident');
		if (sourceGr.getTableName() == handlerInstance.getCommTaskInstanceForTask())
			return gs.getProperty(handlerInstance.PROPERTIES.NOTIFY_NUMBER, "");
	},

	isActionAllowed: function(actionName, sourceGr, /* Optional */ userId) {
		if (!sourceGr.instanceOf(this.TABLE_INCIDENT_ALERT) && !sourceGr.instanceOf(this.TABLE_INCIDENT_ALERT_TASK))
			return;
		if (actionName === this.ACTION.SELF_JOIN) {
			if (!userId)
				userId = gs.getUserID();
			if (userId)
				return GlideUser.getUserByID(userId).hasRole('itil') || GlideUser.getUserByID(userId).hasRole('sn_incident_write');
		}
		return;
	},

    type: 'IncidentCommunicationParticipants'
};
