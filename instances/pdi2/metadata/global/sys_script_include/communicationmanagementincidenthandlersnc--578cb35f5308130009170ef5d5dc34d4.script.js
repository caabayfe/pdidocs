var CommunicationManagementIncidentHandlerSNC = Class.create();
CommunicationManagementIncidentHandlerSNC.prototype = Object.extendsObject(sn_comm_management.CommunicationManagementDefaultHandlerSNC, {
	initialize: function() {
		sn_comm_management.CommunicationManagementDefaultHandlerSNC.prototype.initialize.call(this);
		this.TABLES.INCIDENT = 'incident';
		this.TABLES.INCIDENT_TASK = 'incident_task';
		this.TABLES.INCIDENT_ALERT = 'incident_alert';
		this.TABLES.INCIDENT_ALERT_TASK = 'incident_alert_task';
		this.TABLES.NOTIFY_PARTICIPANT = 'notify_participant';
		this.TABLES.CMN_ROTA = 'cmn_rota';
		this.COLUMNS.ASSIGNMENT_GROUP = 'assignment_group';
		this.COLUMNS.ASSIGNED_TO = 'assigned_to';
		this.COLUMNS.GROUP = 'group';
		this.COLUMNS.USER = 'user';
		this.COLUMNS.INCIDENT = 'incident';
		this.COLUMNS.NOTIFY_CONFERENCE_CALL = 'notify_conference_call';
		this.PROPERTIES.NOTIFY_NUMBER = 'com.snc.iam.notify_number'; //Overriden for incident to not effect upgrading customers
		this.PROPERTIES.ESCALATION_LEVEL = 'com.snc.iam.on_call_escalation_level';
		this.PROPERTIES.MAX_CONTACT_LIMIT_EMAIL = 'com.snc.iam.max_contact_limit_email';
		this.PROPERTIES.MAX_CONTACT_LIMIT_SMS = 'com.snc.iam.max_contact_limit_sms';
		this.PROPERTIES.CONFERENCE_CALL_ESCALATION_WORKFLOW = 'com.snc.iam.conference_call_escalation_workflow';
		this.PROPERTIES.ESCALATE_CONFERENCE = 'com.snc.iam.conference_call_follow_on_call_escalation';
		this.PROPERTIES.ENABLE_NOTIFY = 'com.snc.iam.enable_notify';
		this.PROPERTIES.ADD_ALL_MEMBERS_ON_NO_ROTA_DEFINED = 'com.snc.iam.add_all_members_on_no_rota_defined';
		this.PROPERTIES.RESET_TIMER_ON_SNOOZE = "com.snc.iam.reset_timer_on_snooze";
	},

	DEFAULT_TEMPLATES: {
		EMAIL: 'e87ea60987a013000e3dd61e36cb0bbe',
		SMS: '621be6c587a013000e3dd61e36cb0bea'
	},

	getCommPlanInstanceForTask: function() {
		return this.TABLES.INCIDENT_ALERT;
	},

	getCommTaskInstanceForTask: function() {
		return this.TABLES.INCIDENT_ALERT_TASK;
	},
	
	getClassNameForConferenceEscalation: function(conferenceCallGr) {
		return this.TABLES.INCIDENT;
	},

	unsupportedChannelsMsg: function(channels, commTaskGr) {
		var unsupportedChannels = [];
		channels.forEach(function(channel) {
			if (channel.hideForWorkbench)
				unsupportedChannels.push(channel.channelType.display_value);
		});
		
		var incidentSysId = commTaskGr.comm_plan.source_incident + "";
		var commTaskSysId = commTaskGr.sys_id + "";
		
		var hereLink = "<a target='_blank' href='/now/sow/record/incident/" + incidentSysId + "/sub/record/incident_alert_task/" + commTaskSysId + "'>";

		if (unsupportedChannels.length === 1)
			return gs.getMessage("{0} channel is supported only in Service Operations Workspace, to open click {1}here{2}", [unsupportedChannels[0], hereLink,  "</a>"]);
		else if (unsupportedChannels.length > 1)
			return gs.getMessage("{0} channels are supported only in Service Operations Workspace, to open click {1}here{2}", [unsupportedChannels.join(", "), hereLink,  "</a>"]);
	},

	peparePlanInstanceGr: function(planDefGr, planInstanceGr, sourceRecordGr) {
		sn_comm_management.CommunicationManagementDefaultHandlerSNC.prototype.peparePlanInstanceGr(planDefGr, planInstanceGr, sourceRecordGr);
		planInstanceGr.source_incident = sourceRecordGr.getUniqueValue();
	},

	prepareTaskInstanceGr: function(planTaskGr, planTaskDefGr, planInstanceGr) {
		sn_comm_management.CommunicationManagementDefaultHandlerSNC.prototype.prepareTaskInstanceGr(planTaskGr, planTaskDefGr, planInstanceGr);
		planTaskGr.incident_alert = planInstanceGr.getUniqueValue();
	},

	prepareAdhocCommTaskGr: function(commTaskGr, commPlanGr, commTaskBody) {
		sn_comm_management.CommunicationManagementDefaultHandlerSNC.prototype.prepareAdhocCommTaskGr(commTaskGr, commPlanGr, commTaskBody);
		commTaskGr.incident_alert = commPlanGr.getUniqueValue();
	},

	prepareAdhocCommPlanGr: function(commPlanGr, commPlanBody, sourceGr) {
		sn_comm_management.CommunicationManagementDefaultHandlerSNC.prototype.prepareAdhocCommPlanGr(commPlanGr, commPlanBody, sourceGr);
		commPlanGr.source_incident = sourceGr.getUniqueValue();
	},

	/*Called when a channel communication is sent out*/
	prepareTaskUpdatesPerChannelCommunication: function(commTaskGr, channelUpdates, currentTime) {
		sn_comm_management.CommunicationManagementDefaultHandlerSNC.prototype.prepareTaskUpdatesPerChannelCommunication(commTaskGr, channelUpdates, currentTime);
		if (commTaskGr && commTaskGr.communication_frequency == this.COMMUNICATION_FREQUENCY_TYPE.ONE_TIME && channelUpdates && channelUpdates.update_terminal_state)
			commTaskGr.state = this.COMM_TASK_STATES.COMPLETED;
		if (commTaskGr && commTaskGr.state == this.COMM_TASK_STATES.PENDING && channelUpdates && channelUpdates.update_last_communication) {
			commTaskGr.state = this.COMM_TASK_STATES.OPEN;
		}
	},

	/*Called from Work Bench Actions*/
	updateTaskStateWBActions: function(commTaskSysId, action) {
		var commTaskGr = new GlideRecord(this.getCommTaskInstanceForTask());
		var shouldUpdate = false;
		if (commTaskGr.get(commTaskSysId)) {
			if (action == this.COMM_TASK_ACTIONS.CLOSE) {
				if (commTaskGr.last_communication)
					commTaskGr.state = this.COMM_TASK_STATES.COMPLETED;
				else
					commTaskGr.state = this.COMM_TASK_STATES.SKIPPED;

				shouldUpdate = true;
			} else if (action == this.COMM_TASK_ACTIONS.SNOOZE) {
				if (commTaskGr.communication_frequency == this.COMMUNICATION_FREQUENCY_TYPE.RECURRING && commTaskGr.due_in && commTaskGr.due_date) {
					var dueIn = new GlideDateTime(commTaskGr.due_in).getNumericValue() / 1000;
					var dueDate = new GlideDateTime(commTaskGr.due_date);
					var resetTimer = gs.getProperty(this.PROPERTIES.RESET_TIMER_ON_SNOOZE, 'false') + '' === 'true';
					var currentTime = new GlideDateTime();
					var diffCurrentNDueDate = currentTime.getNumericValue() - dueDate.getNumericValue();
					if (diffCurrentNDueDate > 0 && resetTimer) {
						var nextDue = new GlideDateTime();
						nextDue.addSeconds(dueIn);
						commTaskGr.due_date = nextDue.getDisplayValue();
					} else {
						dueDate.addSeconds(dueIn);
						commTaskGr.due_date = dueDate.getDisplayValue();
					}
					shouldUpdate = true;
				}
			} else if (action == this.COMM_TASK_ACTIONS.START && commTaskGr.state == this.COMM_TASK_STATES.PENDING) {
				commTaskGr.state = this.COMM_TASK_STATES.OPEN;
				shouldUpdate = true;
			}

			if (shouldUpdate)
				return commTaskGr.update();

		}
		return false;
	},

	onConferenceParticipantChange: function (commTaskGr, participants) {
		if (typeof commTaskGr == 'string' && commTaskGr.length > 0) {
			var sysId = commTaskGr;
			commTaskGr = new GlideRecord(this.getCommTaskInstanceForTask());
			if (!commTaskGr.get(sysId))
				return;
		}
		if(commTaskGr.comm_plan && commTaskGr.comm_plan.source)
			gs.eventQueue('conference.incident_alert_task', commTaskGr, participants);
	},

	/*Called from State Management - On Task Completion BR on comm_task. This is a after BR*/
	onCommTaskCompletion: function(current, previous) {
		var commPlanGr;
		/*Check for open tasks of same order - do nothing*/
		var commTaskGr = new GlideRecord(this.getCommTaskInstanceForTask());
		commTaskGr.addActiveQuery();
		commTaskGr.addQuery(this.COLUMNS.COMM_PLAN, current.comm_plan);
		commTaskGr.addNotNullQuery(this.COLUMNS.ORDER); //Nulls are inserted in open. So ignore.
		commTaskGr.addQuery(this.COLUMNS.ORDER, current.order);
		commTaskGr.query();
		if (commTaskGr.hasNext())
			return; // There are more tasks for the same order so don't do anything

		/*Check for pending tasks of different order. Open the lowest set*/
		commTaskGr = new GlideRecord(this.getCommTaskInstanceForTask());
		commTaskGr.addQuery(this.COLUMNS.COMM_PLAN, current.comm_plan);
		commTaskGr.addQuery(this.COLUMNS.STATE, this.COMM_TASK_STATES.PENDING);
		commTaskGr.addNotNullQuery(this.COLUMNS.ORDER); //Nulls are inserted in open state. So ignore.
		commTaskGr.addQuery(this.COLUMNS.ORDER, '!=', current.order); //fetch both lower and higher order
		commTaskGr.orderBy(this.COLUMNS.ORDER);
		commTaskGr.query();
		var order;
		var cnt = 0;
		while (commTaskGr.next()) {
			if (cnt == 0)
				order = commTaskGr.order * 1;

			if (order != commTaskGr.order * 1)
				break; // break if next higher order is seen

			commTaskGr.state = this.COMM_TASK_STATES.OPEN;
			if (current.comm_plan.state == this.COMM_PLAN_STATES.NEW) {
				commPlanGr = current.comm_plan.getRefRecord();
				commPlanGr.state = this.COMM_PLAN_STATES.WIP;
				commPlanGr.update();
			}
			commTaskGr.update();
			cnt ++;
		}
	},

	/*Called from State Management-Decide state per order BR on comm_task.
	* WARNING - Hence don't use current.update()
	*/
	decideStatePerOrder: function(current, previous) {

		var commPlanGr;
		if (gs.nil(current.order)) {
			current.state = this.COMM_TASK_STATES.OPEN;
			if (current.comm_plan.state == this.COMM_PLAN_STATES.NEW) {
				commPlanGr = current.comm_plan.getRefRecord();
				commPlanGr.state = this.COMM_PLAN_STATES.WIP;
				commPlanGr.update();
			}
		} else if (current.order) {
			var commTaskGr = new GlideRecord(this.getCommTaskInstanceForTask());
			commTaskGr.addQuery(this.COLUMNS.COMM_PLAN, current.comm_plan);
			commTaskGr.addActiveQuery();
			commTaskGr.addNotNullQuery(this.COLUMNS.ORDER);
			commTaskGr.addQuery(this.COLUMNS.ORDER, '<', current.order);
			commTaskGr.query();
			if (commTaskGr.hasNext()) {
				current.state = this.COMM_TASK_STATES.PENDING;
			} else {
				current.state = this.COMM_TASK_STATES.OPEN;
				if (current.comm_plan.state == this.COMM_PLAN_STATES.NEW) {
					commPlanGr = current.comm_plan.getRefRecord();
					commPlanGr.state = this.COMM_PLAN_STATES.WIP;
					commPlanGr.update();
				}
			}
		}
	},

	prepareGroupsInvolved: function(sysId){
		var respData={};
		var groupsInfo = {};
		var onCallActive = GlidePluginManager.isActive("com.snc.on_call_rotation");
		var notifyActive = GlidePluginManager.isActive("com.snc.notify");
		var taskGr = new GlideRecord(this.TABLES.INCIDENT);

		/* groups and members invloved in incident */
		if (taskGr.get(sysId)) {
			if (taskGr.assignment_group && taskGr.assigned_to) {
				groupsInfo[taskGr.assignment_group] = {};
				groupsInfo[taskGr.assignment_group]['display_value'] = taskGr.assignment_group.getDisplayValue();
				groupsInfo[taskGr.assignment_group]['members'] = [taskGr.assigned_to + ""];
			}
		}

		/* groups and members involved in incident alert task */
		var commTaskGr = new GlideRecord(this.getCommTaskInstanceForTask());
		commTaskGr.addQuery(this.COLUMNS.COMM_PLAN + '.' + this.COLUMNS.SOURCE, sysId);
		groupsInfo = this._prepareGroupsInvolvedHelper(commTaskGr, groupsInfo, this.COLUMNS.ASSIGNMENT_GROUP, this.COLUMNS.ASSIGNED_TO);

		/* groups and members involved in conference call */
		if (notifyActive) {
			var commChannelConfGr = new GlideRecord(this.TABLES.COMM_CHANNEL_CONFERENCE);
			commChannelConfGr.addQuery(this.COLUMNS.COMM_TASK + '.' + this.COLUMNS.COMM_PLAN + '.' + this.COLUMNS.SOURCE, sysId);
			commChannelConfGr.addQuery(this.COLUMNS.STATE,'started');
			commChannelConfGr.query();
			while (commChannelConfGr.next()) {
				var notifyParticipantGr = new GlideRecord(this.TABLES.NOTIFY_PARTICIPANT);
				notifyParticipantGr.addQuery(this.COLUMNS.NOTIFY_CONFERENCE_CALL, commChannelConfGr.notify_conference_call);
				groupsInfo = this._prepareGroupsInvolvedHelper(notifyParticipantGr, groupsInfo, this.COLUMNS.GROUP, this.COLUMNS.USER);
			}
		}

		/* groups and members involved in incident task */
		var incidentTaskGr = new GlideRecord(this.TABLES.INCIDENT_TASK);
		incidentTaskGr.addQuery(this.COLUMNS.INCIDENT, sysId);
		groupsInfo = this._prepareGroupsInvolvedHelper(incidentTaskGr, groupsInfo, this.COLUMNS.ASSIGNMENT_GROUP, this.COLUMNS.ASSIGNED_TO);

		var membersInvolved = [];
		/* on-call members active now data*/
		if (onCallActive) {
			for (var key in groupsInfo) {
				groupsInfo[key]['hasRotas'] = this._groupHasRotas(key);
				membersInvolved = membersInvolved.concat(groupsInfo[key].members);
			}
		}
		else {
			/* total unique members involved */
			for (var i in groupsInfo) {
				membersInvolved = membersInvolved.concat(groupsInfo[i].members);
			}
		}
		membersInvolved = new ArrayUtil().unique(membersInvolved);
		respData.uniqueMembers = membersInvolved.length;
		respData['groups'] = groupsInfo;
		return respData;
	},

	_prepareGroupsInvolvedHelper: function(gr, groupsInfo, groupAttribute, userAttribute) {
		gr.addActiveQuery();
		gr.addNotNullQuery(groupAttribute);
		gr.addNotNullQuery(userAttribute);
		gr.query();
		while (gr.next()) {
			if (!groupsInfo[gr[groupAttribute]]) {
				groupsInfo[gr[groupAttribute]] = {};
				groupsInfo[gr[groupAttribute]]['display_value'] = gr[groupAttribute].getDisplayValue();
				groupsInfo[gr[groupAttribute]]['members'] = [gr[userAttribute] + ""];
			}
			else if (gr[userAttribute] && (groupsInfo[gr[groupAttribute]]['members'].indexOf(gr[userAttribute] + "") == -1)) {
				groupsInfo[gr[groupAttribute]]['members'].push(gr[userAttribute] + "");
			}
		}
		return groupsInfo;
	},

	_groupHasRotas: function(sysId) {
		/* returns true if group has rotas defined else returns false */
		var cmnRotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
		cmnRotaGr.addQuery(this.COLUMNS.GROUP, sysId);
		cmnRotaGr.query();
		return cmnRotaGr.hasNext();
	},
	
	/* returns the sys_id of the incident */
	getTaskIdForConferenceEscalation: function(conferenceCallGr) {
		var gr = new GlideRecord(conferenceCallGr.table);
		if (gr.get(conferenceCallGr.source + '') && !JSUtil.nil(gr.incident_alert))
			return gr.incident_alert.source + '';
	},
	
	getConferenceDefaultTitle: function(data) {
		var gr = new GlideRecord(data.table);
		if (gr.get(data.sysId))
			return gr.incident_alert.source_incident.number + ' - ' + gr.incident_alert.source_incident.short_description + ' - ' + gr.short_description;
		return '';
	},
	
	canViewCollaborationActions: function() {
		if (gs.getUser().hasRole('itil,sn_incident_write'))
			return true;
		return false;	
	},
	
	getCommunicateExcludeList: function() {
		var excludedTables = gs.getProperty('com.snc.incident.communication_recipients_excluded_tables');
		var excludeList = excludedTables.split(',');
		return excludeList;
	},

	type: 'CommunicationManagementIncidentHandlerSNC'
});
