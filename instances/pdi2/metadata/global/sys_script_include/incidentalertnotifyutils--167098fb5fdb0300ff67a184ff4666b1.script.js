var IncidentAlertNotifyUtils = Class.create();
IncidentAlertNotifyUtils.prototype = {

	TABLE_INCIDENT_ALERT: 'incident_alert',
	TABLE_INCIDENT_ALERT_TASK: 'incident_alert_task',
	TABLE_NOTIFY_PARTICIPANT: 'notify_participant',
	TABLE_SYS_USER_GRMEMBER: 'sys_user_grmember',

	FIELD_USER: 'user',
	FIELD_GROUP: 'group',
	FIELD_GROUP_ACTIVE:'group.active',

	initialize: function() {
    },

	isConferenceLeader: function(gr, userId) {
		if (!gr.instanceOf(this.TABLE_INCIDENT_ALERT) && !gr.instanceOf(this.TABLE_INCIDENT_ALERT_TASK))
			return false;
		if ((!userId && gs.hasRole('ia_admin')) || GlideUser.getUserByID(userId).hasRole('ia_admin'))
			return true;
		return this.isIncidentAlertAssignedToUser(gr, userId);
	},

	isIncidentAlertAssignedToUser: function(gr, userId) {
		var table = gr.getRecordClassName();
		if (!userId)
			userId = gs.getUserID();
		if (table == this.TABLE_INCIDENT_ALERT)
			return GlideUser.getUserByID(userId).hasRole('itil,sn_incident_write') && gr.assigned_to == userId;
		else if(table == this.TABLE_INCIDENT_ALERT_TASK)
			return new sn_comm_management.CommTaskNotifyUtils().isConferenceLeader(gr, userId);
		
		return false;
	},

	getGroupMessage: function(partId) {
		var grpLi = [];
		var partGr = new GlideRecord(this.TABLE_NOTIFY_PARTICIPANT);
		var user;
		var grp;
		var srcTable;
		if (partGr.get(partId)) {
			user = partGr.getValue(this.FIELD_USER);
			grp = partGr.getValue(this.FIELD_GROUP);
			srcTable = partGr.notify_conference_call.table + '';
		}
		var isIncSrc = srcTable.indexOf('incident') > -1? true: false;
		if (user && JSUtil.nil(grp) && isIncSrc) {
			var ugr = new GlideRecord(this.TABLE_SYS_USER_GRMEMBER);
			ugr.addQuery(this.FIELD_USER, user);
			ugr.addQuery(this.FIELD_GROUP_ACTIVE, true);
			ugr.query();
			while (ugr.next())
				grpLi.push(ugr.getDisplayValue(this.FIELD_GROUP));
		}
		var grps = grpLi.join(', ');
		var msg = '';
		if (grpLi.length > 1)
			msg = gs.getMessage(' {0} ', grps);

		return msg;
	},

	isInitiateConferenceAllowed: function(current) {
		return current.state != 'cancelled' && current.state != 'resolved' && current.state != 'closed' && this.isConferenceLeader(current);
	},

	isJoinConferenceAllowed: function(current) {
		return current.state != 'cancelled' && current.state != 'resolved' && current.state != 'closed' && gs.hasRole('ia_admin,itil,sn_incident_write');
	},

    type: 'IncidentAlertNotifyUtils'
};
