var OnCallEscalationTemplateSNC = Class.create();
OnCallEscalationTemplateSNC.prototype = {
    initialize: function() {
		this.TABLES = {
			ESCALATION_POLICY_TEMPLATE: "on_call_template_escalation_policy",
			ESCALATION_STEP_TEMPLATE: "on_call_template_escalation_step",
			ESCALATION_SET: "cmn_rota_escalation_set",
			ESCALATION_STEP: "cmn_rota_esc_step_def",
			SHIFT: "cmn_rota",
			ROSTER: "cmn_rota_roster",
			ROSTER_MEMBER: "cmn_rota_member"
		};

		this.rosters = [];
		this.stepNumber = -1;
    },

	_getRecord: function(table, sysId) {
		var gr = new GlideRecord(table);
		if (gr.get(sysId))
			return gr;
		return null;
	},

	_getEscalationStepTemplates: function(escTemplateSysId) {
		var stepTemplate = new GlideRecord(this.TABLES.ESCALATION_STEP_TEMPLATE);
		stepTemplate.addQuery("escalation_policy_template", escTemplateSysId);
		stepTemplate.orderBy("step");
		stepTemplate.query();

		return stepTemplate;
	},

	_getRosters: function(escalationSetGr) {
		var rosterGr = new GlideRecord(this.TABLES.ROSTER);
		rosterGr.addQuery("rota", escalationSetGr.cmn_rota);
		rosterGr.orderBy("order");
		rosterGr.query();
		
		return rosterGr;
	},

	_getRosterSysIds: function(rostersPosition, result, stepNumber) {
		var rostersIndexes = rostersPosition.split(",").map(function(val){
			return parseInt(val);
		}).sort(function(index1, index2) {
			return index1 < index2;
		});

		var rosterSysIds = [];
		for (var index = 1; index <= this.rosters.length && this.rosters.length >= rostersIndexes[0]; index++) {
			if (rostersIndexes[0] == index) {
				rosterSysIds.push(this.rosters[index - 1]);
				rostersIndexes.shift();
			}
		}

		if (rostersIndexes.length > 0) {
			if (!result.warning)
				result.warning = {
					message: "",
					not_matching_steps: {}
				};
			result.warning.message = gs.getMessage("Roster position index is not matching with the rosters defined on the Shift");
			result.warning.not_matching_steps[stepNumber] = rostersIndexes;
		}

		return rosterSysIds;
	},

	_initializeEscalationStep: function(stepTemplateGr, escalationSetGr) {
		var escalationStepGr = new GlideRecord(this.TABLES.ESCALATION_STEP);
		escalationStepGr.initialize();
		escalationStepGr.escalation_set = escalationSetGr.getUniqueValue();
		escalationStepGr.name = stepTemplateGr.name;
		
		escalationStepGr.escalation_level = parseInt(stepTemplateGr.getValue("step"));
		
		escalationStepGr.reminders = stepTemplateGr.reminders;
		escalationStepGr.time_between_reminders = stepTemplateGr.time_between_reminders;
		escalationStepGr.time_to_next_step = stepTemplateGr.time_to_next_step;

		return escalationStepGr;
	},

	_copyAudiences: function(stepTemplateGr, escalationStepGr) {
		if (stepTemplateGr.sys_user_groups)
			escalationStepGr.sys_user_groups = stepTemplateGr.sys_user_groups;
		if (stepTemplateGr.sys_users)
			escalationStepGr.sys_users = stepTemplateGr.sys_users;
		if (stepTemplateGr.cmn_notif_devices)
			escalationStepGr.cmn_notif_devices = stepTemplateGr.cmn_notif_devices;
		if (stepTemplateGr.group_manager) {
			escalationStepGr.group_manager = stepTemplateGr.group_manager;
			escalationStepGr.group_manager_field = stepTemplateGr.group_manager_field;
		}
	},

	_getRosterMembers: function(rosterSysId) {
		var rosterMembersGr = new GlideRecord(this.TABLES.ROSTER_MEMBER);
		rosterMembersGr.addQuery("roster", rosterSysId);
		rosterMembersGr.query();

		return rosterMembersGr;
	},

	_processRotateThroughMembers: function(stepTemplateGr, escalationSetGr, result) {
		var rosterSysIds = this._getRosterSysIds(stepTemplateGr.roster_position_rtm, result, stepTemplateGr.step);
		if (rosterSysIds.length > 0) {
			var escalationStepGr = this._initializeEscalationStep(stepTemplateGr, escalationSetGr);
			escalationStepGr.rotate_through_member = true;
			escalationStepGr.cmn_rota_roster_rtm = rosterSysIds[0];
			escalationStepGr.insert();
		}
	},

	_isValidStep: function (stepTemplateGr, result) {
		if (stepTemplateGr.rotate_through_member) {
			if (!stepTemplateGr.roster_position_rtm)
				return false;
			var rosterSysIds = this._getRosterSysIds(stepTemplateGr.roster_position_rtm, result, stepTemplateGr.step);
			if (rosterSysIds.length == 0)
				return false;
			return true;
		} else {
			if (stepTemplateGr.sys_user_groups)
				return true;
			else if (stepTemplateGr.sys_users)
				return true;
			else if (stepTemplateGr.cmn_notif_devices)
				return true;
			else if (stepTemplateGr.group_manager)
				return true;
			else if (!stepTemplateGr.rotate_through_member) {
				if(!stepTemplateGr.rosters_position)
					return false;
				var rosterSysIds = this._getRosterSysIds(stepTemplateGr.rosters_position, result, stepTemplateGr.step);
				if (rosterSysIds.length > 0)
					return true;
			}
			return false;
		}
	},

	_isGroupEscalation: function(escalationSetGr) {
		return escalationSetGr.group_escalation;
	},

	_copyStepTemplate: function(stepTemplateGr, escalationSetGr, result) {
		if (!this._isValidStep(stepTemplateGr, result)) {
			if (!result.warning)
				result.warning = {};
			result.warning.message = gs.getMessage("Skipped copying templates for some of the steps since no audiences are defined");
			if(!result.warning.skipped_steps)
				result.warning.skipped_steps = [];
			result.warning.skipped_steps.push(stepTemplateGr.step + "");
			return;
		}
		if (stepTemplateGr.rotate_through_member) {
			this._processRotateThroughMembers(stepTemplateGr, escalationSetGr, result);
			return;
		}

		var escalationStepGr = this._initializeEscalationStep(stepTemplateGr, escalationSetGr);
		this._copyAudiences(stepTemplateGr, escalationStepGr);
		if (stepTemplateGr.rosters_position) {
			if (!this._isGroupEscalation(escalationSetGr)) {
				var rosterSysIds = this._getRosterSysIds(stepTemplateGr.rosters_position, result, stepTemplateGr.step);
				if (rosterSysIds.length > 0) {
					escalationStepGr.cmn_rota_rosters = rosterSysIds.join(",");
					escalationStepGr.roster_escalation = stepTemplateGr.roster_escalation;
				}
			} else {
				escalationStepGr.roster_position = stepTemplateGr.rosters_position;
			}
		}
		escalationStepGr.insert();
	},

	_checkIfEscStepsAlreadyExists: function(escalationSetSysId) {
		var stepDefGr = new GlideRecord(this.TABLES.ESCALATION_STEP);
		stepDefGr.addQuery("escalation_set", escalationSetSysId);
		stepDefGr.setLimit(1);
		stepDefGr.query();

		if(stepDefGr.hasNext()) {
			return true;
		}

		return false;
	},

	/*
	* Create escalation set steps based on the escalation policy template steps
	* templateSysId - sys_id of the template
	* escalationSetSysId - sys_id of the escalation set record
	* return - API will return data in the following format
			{
				error: "",
				warning: {
					message: "",
					skipped_steps: [],
					not_matching_steps: {}
				}
			};
	*/
	copyEscalationTemplatetoEscalationSet: function(templateSysId, escalationSetSysId) {
		var result = {};
		
		var escTemplateGr = this._getRecord(this.TABLES.ESCALATION_POLICY_TEMPLATE, templateSysId);
		if (!escTemplateGr) {
			result.error = gs.getMessage("Provided template sys_id is not valid");
			return result;
		}

		var escalationSetGr = this._getRecord(this.TABLES.ESCALATION_SET, escalationSetSysId);
		if (!escalationSetGr) {
			result.error = gs.getMessage("Provided escalation set sys_id is not valid");
			return result;
		}

		if (this._checkIfEscStepsAlreadyExists(escalationSetSysId)) {
			result.error = gs.getMessage("Escalation step definitions already exist");
			return result;
		}

		var roster = this._getRosters(escalationSetGr);
		while(roster.next()) {
			this.rosters.push(roster.sys_id + "");
		}

		var stepTemplate = this._getEscalationStepTemplates(templateSysId);
		while(stepTemplate.next()) {
			this._copyStepTemplate(stepTemplate, escalationSetGr, result);
		}

		return result;
	},

	deleteEscalationSetSteps: function(escalationSetSysId) {
		if (!escalationSetSysId) {
			gs.addErrorMessage(gs.getMessage("Not a valid escalation set sys_id"));
			return;
		}

		var escalationStepGr = new GlideRecord(this.TABLES.ESCALATION_STEP);
		escalationStepGr.addQuery("escalation_set", escalationSetSysId);
		escalationStepGr.query();

		escalationStepGr.setWorkflow(false);
		escalationStepGr.deleteMultiple();

	},

    type: 'OnCallEscalationTemplateSNC'
};
