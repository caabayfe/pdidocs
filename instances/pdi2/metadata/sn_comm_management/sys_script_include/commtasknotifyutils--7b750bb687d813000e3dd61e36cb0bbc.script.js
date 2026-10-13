var CommTaskNotifyUtils = Class.create();
CommTaskNotifyUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	TABLE_COMM_TASK: 'comm_task',
	TABLE_NOTIFY_PARTICIPANT: 'notify_participant',
	TABLE_SYS_USER_GRMEMBER: 'sys_user_grmember',

	FIELD_USER: 'user',
	FIELD_GROUP: 'group',
	FIELD_GROUP_ACTIVE:'group.active',

	isConferenceLeader: function(gr, userId) {
		if (!userId)
			userId = gs.getUserID();

		//Todo - This should use handlers
		if (userId) {
			var gUser = new global.IncidentUtils().getUserByIdObj(userId);
			if (gr.getRecordClassName() == 'incident_alert_task') {
				if (gr.active && gUser.hasRole('itil,sn_incident_write') && (gr.assigned_to == userId || gr.incident_alert.assigned_to == userId)) //For itil check this. If this is false, next condition applies for all
					return true;
			}

			return !!(gr.active && (gUser.hasRole('sn_comm_management.comm_plan_manager') || gUser.hasRole('sn_comm_management.comm_plan_admin')));
		}
		return !!(gr.getRecordClassName() == 'comm_task' && gr.active && (gs.hasRole('sn_comm_management.comm_plan_admin') || gs.hasRole('sn_comm_management.comm_plan_manager')));
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
		if (user && !grp) {
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
	
	isEscalateConference: function(commTaskTable, commTaskId) {
		var recordTable = '';
		if (commTaskTable == 'incident_alert_task')
			recordTable = 'incident';
		else {
			var commTaskGr = new GlideRecord(commTaskTable);
			if (commTaskGr.get(commTaskId)) {
				recordTable = commTaskGr.comm_plan.source.getRefRecord().getRecordClassName();
			}
		}
		var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(recordTable);
		return gs.getProperty(handlerInstance.PROPERTIES.ESCALATE_CONFERENCE);
	},

    type: 'CommTaskNotifyUtils'
});
