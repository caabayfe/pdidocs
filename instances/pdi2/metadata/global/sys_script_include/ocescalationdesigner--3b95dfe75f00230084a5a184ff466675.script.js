var OCEscalationDesigner = Class.create();
OCEscalationDesigner.prototype = {
	initialize: function() {
		this.JSUtil = new JSUtil();
		this.OnCallCommon = new OnCallCommon();
	},
	TABLES: {
		ESCALATION_SET: 'cmn_rota_escalation_set',
		ESCALATION_STEP: 'cmn_rota_esc_step_def',
		CMN_ROTA: 'cmn_rota',
		CMN_ROTA_ROSTER: 'cmn_rota_roster'
	},
	ATTRS: {
		ACTIVE: 'active',
		NAME: 'name',
		CMN_ROTA: 'cmn_rota',
		CMN_ROTA_ROSTER: 'cmn_rota_roster',
		CMN_ROTA_ROSTERS: 'cmn_rota_rosters',
		ROSTER_ESCALATION: 'roster_escalation',
		DESCRIPTION: 'description',
		ESCALATION_SET: 'escalation_set',
		ESCALATION_LEVEL: 'escalation_level',
		USERS_LIST: 'sys_users',
		GROUPS_LIST: 'sys_user_groups',
		DEVICES_LIST: 'cmn_notif_devices',
		REMINDERS: 'reminders',
		TIME_BETWEEN_REMINDERS: 'time_between_reminders',
		TIME_TO_NEXT_STEP: 'time_to_next_step',
		DEFAULT: 'default',
		GROUP_MANAGER: 'group_manager',
		GROUP_MANAGER_FIELD: 'group_manager_field',
		ORDER: 'order',
		TABLE: 'table',
		CONDITION: 'condition',
		OVERRIDE_USER_CONTACT_PREFERENCE: 'override_user_contact_preference',
		GROUP_ESCALATION: 'group_escalation',
		ROSTER_POSITION: 'roster_position',
		ROTATE_THROUGH_MEMBER: 'rotate_through_member',
		ROSTER_POSITION_RTM: 'cmn_rota_roster_rtm'
	},
	getRotaEscalationSets: function (rotaId) {
		var isGroupEscalation = false;
		var groupEscalationGr = new OnCallRotation().getGroupEscalationGr(rotaId);

		if (groupEscalationGr) {
			isGroupEscalation = true;
		}

		var escalationSets = [];
		var escalationSetGr = new GlideRecord(this.TABLES.ESCALATION_SET);
		if (isGroupEscalation) {
			escalationSetGr.addQuery(this.ATTRS.GROUP_ESCALATION, groupEscalationGr.getUniqueValue());
		}
		else {
			escalationSetGr.addQuery(this.ATTRS.CMN_ROTA, rotaId);
		}
		escalationSetGr.addActiveQuery();
		escalationSetGr.orderBy("order");
		escalationSetGr.query();
		while (escalationSetGr.next()) {
			var escalationSet = {
				sys_id: escalationSetGr.getUniqueValue(),
				name: escalationSetGr.getDisplayValue(),
				is_default: escalationSetGr.getValue('default') == '1',
				table: {
				}
			}
			var tableName = escalationSetGr.getValue('table');
			if (tableName) {
				escalationSet.table.value = tableName;
				escalationSet.table.display_value = new GlideRecord(tableName).getClassDisplayValue();
			}
			escalationSets.push(escalationSet);
		}
		return escalationSets;
	},

	createEscalationSet: function(escalationSet) {
		var createEscalationSetResult = {
			success: false
		};
		var groupEscalationGr = new OnCallRotation().getGroupEscalationGr(escalationSet.cmn_rota);
		var escalationSetGr = new GlideRecord(this.TABLES.ESCALATION_SET);
		escalationSetGr.initialize();
		escalationSetGr.setValue(this.ATTRS.NAME, escalationSet.name);
		escalationSetGr.setValue(this.ATTRS.DESCRIPTION, escalationSet.description);
		if (escalationSet.is_default == true || escalationSet.is_default == false) {
			escalationSetGr.setValue(this.ATTRS.DEFAULT, escalationSet.is_default);
		}
		if (groupEscalationGr) {
			escalationSetGr.setValue(this.ATTRS.GROUP_ESCALATION, groupEscalationGr.getUniqueValue());
		} else {
			escalationSetGr.setValue(this.ATTRS.CMN_ROTA, escalationSet.cmn_rota);
		}
		if (escalationSetGr.canCreate() && escalationSetGr.insert()) {
			createEscalationSetResult.success = true;
			createEscalationSetResult.escalationSetGr = escalationSetGr;
		}
		return createEscalationSetResult;
	},
	getDefaultEscalation: function(rotaSysId, forceCreate) {
		var escalationSetGr = this.getDefaultEscalationSet(rotaSysId);
		if (escalationSetGr.next()) {
			return this.getEscalation(escalationSetGr, rotaSysId);
		}
		else {
			if (forceCreate) {
				var defaultEscalationSetGr = this.createDefaultEscalationSet(rotaSysId);
				return this.getEscalation(defaultEscalationSetGr, rotaSysId);
			}
			else {
				throw {
					message: gs.getMessage("no default escalation set found for rota with sys_id {0}", rotaSysId),
				};
			}
		}
	},
	createDefaultEscalationSet: function(rotaSysId) {
		var rotaGr = this._getRota(rotaSysId);
		var defaultEscalationSet = {};
		defaultEscalationSet.name = rotaGr.getDisplayValue() + ' - Default escalation set';
		defaultEscalationSet.cmn_rota = rotaGr.getUniqueValue();
		defaultEscalationSet.description = rotaGr.getDisplayValue() + ' - Default escalation set';
		defaultEscalationSet.is_default = true;
		var createEscalationSetResult = this.createEscalationSet(defaultEscalationSet);
		return createEscalationSetResult.escalationSetGr;
	},
	_getRota: function(sysId) {
		var rotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
		if (rotaGr.get(sysId))
			return rotaGr;
	},
	getEscalationSet: function(escalationSetId, rotaId) {
		var escalationSetGr = new GlideRecord(this.TABLES.ESCALATION_SET);
		if (escalationSetGr.get(escalationSetId))
			return this.getEscalation(escalationSetGr, rotaId);
		else {
			throw {
				message: gs.getMessage("escalation set with sys_id {0} not found", escalationSetId),
			};
		}
	},

	_getManagerLabel: function(groupManagerField) {
		if (groupManagerField === "manager")
			return gs.getMessage("Group manager");

		if (groupManagerField.indexOf(".") === -1)
			return gs.getMessage("Manager");

		var splitManagerField = groupManagerField.split(".");
		return gs.getMessage("Manager level {0}", [splitManagerField.length + ""]);
	},

	getEscalation: function (escalationSetGr, rotaId) {
		var isGroupEscalation = !JSUtil.nil(escalationSetGr.getValue(this.ATTRS.GROUP_ESCALATION));

		if (escalationSetGr.canRead()) {
			var escalation = this.OnCallCommon.toJS(escalationSetGr, [this.ATTRS.NAME, this.ATTRS.CMN_ROTA, this.ATTRS.DESCRIPTION, this.ATTRS.DEFAULT, this.ATTRS.ORDER, this.ATTRS.TABLE, this.ATTRS.CONDITION, this.ATTRS.OVERRIDE_USER_CONTACT_PREFERENCE, this.ATTRS.ACTIVE]);
			escalation.steps = [];
			var escalationStepGr = this.getEscalationSteps(escalationSetGr.getUniqueValue());
			var i = 0;
			var delayTillPreviousStep = 0;
			while (escalationStepGr.next()) {
				var escalationStep = this.OnCallCommon.toJS(escalationStepGr, [this.ATTRS.NAME, this.ATTRS.CMN_ROTA, this.ATTRS.ESCALATION_LEVEL, this.ATTRS.REMINDERS, this.ATTRS.TIME_BETWEEN_REMINDERS, this.ATTRS.ESCALATION_SET, this.ATTRS.CMN_ROTA_ROSTERS, this.ATTRS.USERS_LIST, this.ATTRS.GROUPS_LIST, this.ATTRS.DEVICES_LIST, this.ATTRS.TIME_TO_NEXT_STEP, this.ATTRS.ROSTER_ESCALATION, this.ATTRS.ROTATE_THROUGH_MEMBER, this.ATTRS.ROSTER_POSITION_RTM]);
				escalationStep.delay_till_previous_step = {
					value: delayTillPreviousStep,
					display_value: new GlideDuration(delayTillPreviousStep * 1000).getDisplayValue()
				};

				if (escalationStepGr.getValue(this.ATTRS.GROUP_MANAGER) == '1') {
					var managerElement = null;
					var groupManagerField = escalationStepGr.getValue(this.ATTRS.GROUP_MANAGER_FIELD);
					groupManagerField = groupManagerField ? groupManagerField : "manager";

					if (isGroupEscalation && escalationSetGr.group_escalation && escalationSetGr.group_escalation.group)
						managerElement = escalationSetGr.getElement("group_escalation.group." + groupManagerField);
					else if (!isGroupEscalation && escalationSetGr.cmn_rota && escalationSetGr.cmn_rota.group)
						managerElement = escalationSetGr.getElement("cmn_rota.group." + groupManagerField);

					if (managerElement) {
						var managerGr = managerElement.getRefRecord();
						escalationStep.group_manager = {
							sys_id: managerGr.getUniqueValue(),
							display_value: managerGr.getDisplayValue(),
							label: this._getManagerLabel(groupManagerField),
							canRead: escalationStepGr.getElement(this.ATTRS.GROUP_MANAGER).canRead()
						};
					}
				}
				
				if (isGroupEscalation && escalationStepGr.getValue(this.ATTRS.ROSTER_POSITION)) {
					
					var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
					rosterGr.addQuery('rota', rotaId);
					rosterGr.orderBy('order');
					rosterGr.query();
					
					var rosterPosition = escalationStepGr.getValue(this.ATTRS.ROSTER_POSITION);
					rosterPosition = rosterPosition.trim()
						.split(',')
						.map(function(position) {
							return parseInt(position);
						})
						.filter(function(position) {
							return !isNaN(position) && position > 0;
						});
					
					var rosterIndex = 1;
					var rosterNames = [];
					while(rosterGr.next()) {
						if (rosterPosition.indexOf(rosterIndex) > -1) {
							rosterNames.push(rosterGr.name + '');
						}
						rosterIndex++;
					}
					
					escalationStep[this.ATTRS.CMN_ROTA_ROSTERS].display_value = escalationStep[this.ATTRS.CMN_ROTA_ROSTERS].value = rosterNames.join(', ');
				}

				var reminderDuration = escalationStepGr.time_between_reminders.getGlideObject();
				var reminderDelay = reminderDuration ? (reminderDuration.getNumericValue() / 1000) : 0;
				var reminders = parseInt(escalationStepGr.reminders + "");
				var timeToNextStep = escalationStepGr.time_to_next_step.getGlideObject();
				var timeTakenAtStep = reminderDelay * reminders + (timeToNextStep ? (timeToNextStep.getNumericValue() / 1000) : 0);
				delayTillPreviousStep = delayTillPreviousStep + timeTakenAtStep;
				escalationStep.detailed_reminders = [];
				for (var index = 1; index <= reminders; index++) {
					var timeSpentInReminder = index * reminderDelay * 1000;
					escalationStep.detailed_reminders.push({
						value: timeSpentInReminder,
						display_value: gs.getMessage("Reminder {0} - {1}", [index + "", new GlideDuration(timeSpentInReminder).getDisplayValue()])
					});
				}
				escalationStep.time_taken_at_step = {
					value: timeTakenAtStep * 1000,
					display_value: gs.getMessage("{0} delay", new GlideDuration(timeTakenAtStep * 1000).getDisplayValue())
				};
				escalation.steps.push(escalationStep);
				i++;
			}
			escalation.total_time = {
				value:delayTillPreviousStep,
				display_value: new GlideDuration(delayTillPreviousStep * 1000).getDisplayValue()
			};
			
			escalation.contactPreferences = new OnCallContactPreferenceUtil().getContactPreferences('escalation_set', escalationSetGr.getUniqueValue());
			return escalation;
		}
		else {
			throw {
				message: gs.getMessage("Does not have read permission"),
				securityError: true
			};
		}
	},
	getEscalationSteps: function(escalationSetSysId) {
		var escalationStepGr = new GlideRecord(this.TABLES.ESCALATION_STEP);
		escalationStepGr.addQuery(this.ATTRS.ESCALATION_SET, escalationSetSysId);
		escalationStepGr.orderBy(this.ATTRS.ESCALATION_LEVEL);
		escalationStepGr.query();
		return escalationStepGr;
	},
	getDefaultEscalationSet: function (rotaSysId) {
		var groupEscalationGr = new OnCallRotation().getGroupEscalationGr(rotaSysId);

		var escalationSetGr = new GlideRecord(this.TABLES.ESCALATION_SET);
		escalationSetGr.addActiveQuery();
		if (groupEscalationGr) {
			escalationSetGr.addQuery(this.ATTRS.GROUP_ESCALATION, groupEscalationGr.getUniqueValue());
		}
		else {
			escalationSetGr.addQuery(this.ATTRS.CMN_ROTA, rotaSysId);
		}
		escalationSetGr.addQuery(this.ATTRS.DEFAULT, true);
		escalationSetGr.query();
		return escalationSetGr;
	},
	deleteEscalationSet: function(escalationSetSysId) {
		var escalationSetGr = new GlideRecord(this.TABLES.ESCALATION_SET);
		if (escalationSetGr.get(escalationSetSysId)) {
			if (escalationSetGr.canDelete())
				return escalationSetGr.deleteRecord();
			else {
				throw {
					message: gs.getMessage("Does not have delete permission"),
					securityError: true
				};
			}
		}
		else {
			throw {
				message: gs.getMessage("Record not found"),
			};
		}
	},
	deleteEscalationStep: function(escalationStepSysId) {
		var escalationStepGr = new GlideRecord(this.TABLES.ESCALATION_STEP);
		if (escalationStepGr.get(escalationStepSysId)) {
			if (escalationStepGr.canDelete())
				return escalationStepGr.deleteRecord();
			else {
				throw {
					message: gs.getMessage("Does not have delete permission"),
					securityError: true
				};
			}
		}
		else {
			throw {
				message: gs.getMessage("Record not found"),
			};
		}
	},
	hasCustomEscalation: function(rotaSysId) {
		var rotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
		if (rotaGr.get(rotaSysId)) {
			var ocRotation = new OnCallRotation();
			if (ocRotation.isGroupEscalationApplied(rotaGr.getUniqueValue())) {
				return true;
			}
			return rotaGr.use_custom_escalation == true;
		}
	},
	incrementStepsEscalationLevel: function(escalationSetSysId, currentEscalationLevel, rotaId) {
		var escalationSetGr = new GlideRecord(this.TABLES.ESCALATION_SET);
		if (escalationSetGr.get(escalationSetSysId)) {
			var escalationStepGr = new GlideRecord(this.TABLES.ESCALATION_STEP);
			escalationStepGr.addQuery(this.ATTRS.ESCALATION_SET, escalationSetSysId);
			escalationStepGr.addQuery(this.ATTRS.ESCALATION_LEVEL, '>=', currentEscalationLevel);
			escalationStepGr.orderByDesc(this.ATTRS.ESCALATION_LEVEL);
			escalationStepGr.query();
			while (escalationStepGr.next()) {
				if (escalationStepGr.escalation_level.canWrite()) {
					var escalationLevel = escalationStepGr.getValue(this.ATTRS.ESCALATION_LEVEL);
					escalationLevel++;
					escalationStepGr.setValue(this.ATTRS.ESCALATION_LEVEL, escalationLevel);
					escalationStepGr.setWorkflow(false);
					escalationStepGr.update();
				}
				else {
					throw {
						message: gs.getMessage("Does not have write permission"),
						securityError: true
					};
				}
			}
			return this.getEscalationSet(escalationSetSysId, rotaId);
		}
		else {
			throw {
				message: gs.getMessage("escalation set with sys_id {0} not found", escalationSetSysId),
			};
		}
	},
	type: 'OCEscalationDesigner'
};
