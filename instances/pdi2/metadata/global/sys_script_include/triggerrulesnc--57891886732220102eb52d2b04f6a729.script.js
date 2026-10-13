var TriggerRuleSNC = Class.create();

TriggerRuleSNC.prototype = {

	ASSIGNMENT_GROUP: "assignment_group",
	ASSIGNED_TO: "assigned_to",
	DOCUMENT: "document",
	DOCUMENT_TABLE: "document_table",
	GROUP: "group",
	SYS_CREATED_ON: "sys_created_on",
	TABLE: "table",

	TRIGGER_GROUP_FIELD: "trigger_group_field",
	TRIGGER_RULE: "trigger_rule",
	TRIGGER_RULES_LOG_LEVEL: "com.snc.trigger_rules.log.level",
	TRIGGER_RULE_PROCESS: "trigger_rule.process",
	TRIGGER_RULE_REASSIGNMENT: "trigger_rule.reassignment",
	TRIGGER_RULE_TABLE_CFG: "trigger_rule_table_cfg",
	TRIGGER_RULE_WF_CONTEXT: "trigger_rule_wf_context",
	TRIGGER_USER_FIELD: "trigger_user_field",
	TRIGGER_SCRIPT: "trigger_script",
	WF_CONTEXT: "wf_context",
	SUBFLOW_CONTEXT: "subflow_context",
	JOURNAL_FIELD: "journal_field",
	WORK_NOTES: "work_notes",
	PARENT_WF_CONTEXT: "parent_wf_context",
	PARENT_SUBFLOW_CONTEXT: "parent_subflow_context",
	TRIGGER_SUBFLOW: "trigger_subflow",
	INTERNAL_NAME: "internal_name",
	NAME: "name",


	initialize: function() {
		this.eventName = null;
		this.triggerRuleGR = null;
		this.recordGR = null;
		this.workflowVars = {};
		this.subflowInputs = {};
		this._log = new GSLog(this.TRIGGER_RULES_LOG_LEVEL, this.type);

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[initialize] ");
	},
	
	setEventName: function(eventName) {
		this.eventName = eventName;
		return this;
	},

	setRule: function(triggerRule) {
		if (typeof triggerRule === "string") {
			this.triggerRuleGR = new GlideRecord(this.TRIGGER_RULE);
			this.triggerRuleGR.get(triggerRule);
		} else
			this.triggerRuleGR = triggerRule;
		return this;
	},

	setRecord: function(record) {
		this.recordGR = record;
		return this;
	},

	setWorkflowVars: function(workflowVars) {
		this.workflowVars = workflowVars;
		return this;
	},

	process: function() {
		if (!this.triggerRuleGR || !this.recordGR || !this.triggerRuleGR.isValidRecord() || !this.recordGR.isValidRecord()) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[process] Trigger rule record or current record is invalid");
			return;
		}

		var groupField = this.ASSIGNMENT_GROUP;
		var userField = this.ASSIGNED_TO;

		var triggerRuleTableGR = new TriggerRuleTableConfigUtil().getTriggerRuleTableConfigRecord(this.triggerRuleGR.getValue(this.TABLE));
		if (triggerRuleTableGR) {
			groupField = triggerRuleTableGR.getValue(this.TRIGGER_GROUP_FIELD);
			userField = triggerRuleTableGR.getValue(this.TRIGGER_USER_FIELD);
		}

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[process] Trigger rule: " + this.triggerRuleGR.getUniqueValue() + ", group field: " + groupField + ", user field: " + userField);

		if (!this.recordGR.isValidField(groupField) || !this.recordGR.isValidField(userField)) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[process] Trigger rule group or user field not valid for table: " + this.recordGR.getRecordClassName());
			return;
		}

		// Must be a GlideElement as existing workflows used by customers expect the variable to be of type element
		var triggeredGroupElement = null;

		// Use group defined in trigger rule when performing initial assignment (original behavior)
		if (this.TRIGGER_RULE_PROCESS === this.eventName)
			triggeredGroupElement = this.triggerRuleGR[this.GROUP];

		// Use provided group as record changes may not be saved to DB
		if (this.TRIGGER_RULE_REASSIGNMENT === this.eventName)
			triggeredGroupElement = this.recordGR[groupField];

		if (JSUtil.nil(triggeredGroupElement + "")) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[process] Group cannot be found for record table: " + this.recordGR.getRecordClassName() + ", sys_id: " + this.recordGR.getUniqueValue());
			return;
		}

		// Check if the assigned user is valid for the group
		var userSysId = this.recordGR.getValue(userField);
		if (!JSUtil.nil(userSysId) && this._isUserMemberOfGroup(userSysId, triggeredGroupElement + "")) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[process] User field: " + userField + " is already populated with the member: " + userSysId + " of the group: " + triggeredGroupElement);
			return;
		}

		var triggerAction = this.triggerRuleGR.getValue("trigger_action");

		if (triggerAction === "script")
			this._executeTriggerScript();

		if (triggerAction === "workflow")
			this._startTriggerWorkflow(triggeredGroupElement);

		if (triggerAction === "subflow")
			this._startTriggerSubflow(triggeredGroupElement);
	},

	cleanTriggerRuleWorkflowContextTable: function() {
		var daysAgo = gs.getProperty("com.snc.trigger_rules.wf_context_flush_days_ago", "3");
		var triggerWFContextGR = new GlideRecord("trigger_rule_wf_context");
		triggerWFContextGR.addEncodedQuery("sys_created_on<javascript:gs.daysAgo(" + daysAgo + ")");
		triggerWFContextGR.query();
		triggerWFContextGR.deleteMultiple();
	},

	abortActionIfDefaultTriggerRuleExists: function(triggerRuleGR) {
		var gr = new GlideRecord(this.TRIGGER_RULE);
		gr.addQuery(this.TABLE, triggerRuleGR.getValue(this.TABLE));
		gr.addQuery("trigger_group_assigned", true).addOrCondition("run_trigger", "trigger_field_changes");
		gr.addQuery("trigger_when", "default");
		gr.addActiveQuery();
		gr.addQuery("sys_id", "!=", triggerRuleGR.getUniqueValue());
		gr.setLimit(1);
		gr.query();
		if (!gr.next())
			return;
		triggerRuleGR.setAbortAction(true);
		var ruleLink = "<a href='" + gr.getLink() + "'>" + gr.getDisplayValue() + "</a>";
		gs.addInfoMessage(gs.getMessage("Only one default trigger rule per table can be defined. Trigger rule: {0} is the default rule for the {1} table", [ruleLink, triggerRuleGR.getDisplayValue(this.TABLE)]));
	},

	getTriggerRuleWhenToActivateAnnotation: function() {
		return gs.getMessage("Select 'Every time trigger field changes' to process this trigger rule when there is field value change. Use the 'Trigger when' field to define the default behavior for this table or to make it conditional");
	},

	cancelWorkflows: function(contextIds) {
		var workflowUtil = new Workflow();
		var existingWFContextGR = this._getWorkflowsContext(this.recordGR.getRecordClassName(), this.recordGR.getUniqueValue(), contextIds);
		while (existingWFContextGR.next()) {
			workflowUtil.cancelContext(existingWFContextGR.wf_context.getRefRecord());
		}
	},

	cancelSubflows: function(contextIds) {
		var existingSubflowContextGr = this._getSubflowsContext(this.recordGR.getRecordClassName(), this.recordGR.getUniqueValue(), contextIds);
		if (gs.nil(existingSubflowContextGr)) return;
		var reason = gs.getMessage("An On-Call Trigger Rule has started a new subflow, cancelling all running subflows on this record from On-Call Trigger Rules.");
		var escUtil = new OnCallEscalationUtil();
		while (existingSubflowContextGr.next()) {
			var subflowContextId = existingSubflowContextGr.subflow_context + "";
			sn_fd.FlowAPI.cancel(subflowContextId, reason);
			escUtil.updateCanceledEscalation(null, subflowContextId);
		}
	},

	_getSubflowsContext: function(documentTable, documentId, contextIds, filterStates) {
		if ((gs.nil(documentTable) || gs.nil(documentTable)) && gs.nil(contextIds)) return;
		var subflowContextGr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
		if (typeof contextIds !== 'undefined') {
			var query = "sys_idIN" + contextIds;
			subflowContextGr.addEncodedQuery(query);
		} else {
			subflowContextGr.addQuery(this.DOCUMENT_TABLE, documentTable);
			subflowContextGr.addQuery(this.DOCUMENT, documentId);
		}
		if (JSUtil.notNil(filterStates)) {
			filterStates = Array.isArray(filterStates) ? filterState.join(",") : filterStates;
			subflowContextGr.addQuery("state", "IN", filterStates);
		}
		subflowContextGr.addNotNullQuery(this.SUBFLOW_CONTEXT);
		subflowContextGr.query();
		return subflowContextGr;
	},

    _getWorkflowsContext: function(documentTable, documentId, contextIds) {
        var gr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
        if (typeof contextIds !== 'undefined') {
            var query = "sys_idIN" + contextIds;
            gr.addEncodedQuery(query);
        } else {
            gr.addQuery(this.DOCUMENT_TABLE, documentTable);
            gr.addQuery(this.DOCUMENT, documentId);
        }
        gr.query();
        return gr;
	},

	_isUserMemberOfGroup: function(userSysId, groupSysId) {
		var user = GlideUser.getUserByID(userSysId);
		if (!user) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[isUserMemberOfGroup] User: " + userSysId + " not found");
			return false;
		}

		return user.isMemberOf(groupSysId);
	},

	_groupHasRota: function(groupSysId) {
		var rotaGR = new GlideRecord("cmn_rota");
		rotaGR.addActiveQuery();
		rotaGR.addQuery(this.GROUP, groupSysId);
		rotaGR.setLimit(1);
		rotaGR.query();
		return rotaGR.hasNext();
	},

	_getTriggerGroupField: function() {
		var triggerGroupField = "";
		if (this.triggerRuleGR && this.triggerRuleGR.trigger_rule_table_cfg)
			triggerGroupField = this.triggerRuleGR.trigger_rule_table_cfg[this.TRIGGER_GROUP_FIELD] + "";

		return JSUtil.nil(triggerGroupField) ? this.ASSIGNMENT_GROUP : triggerGroupField;
	},

	_getTriggerUserField: function() {
		var triggerUserField = "";
		if (this.triggerRuleGR && this.triggerRuleGR.trigger_rule_table_cfg)
			triggerUserField = this.triggerRuleGR.trigger_rule_table_cfg[this.TRIGGER_USER_FIELD] + "";

		return JSUtil.nil(triggerUserField) ? this.ASSIGNED_TO : triggerUserField;
	},

	_getJournalField: function() {
		var journalField = "";
		if (this.triggerRuleGR && this.triggerRuleGR.trigger_rule_table_cfg)
			journalField = this.triggerRuleGR.trigger_rule_table_cfg[this.JOURNAL_FIELD] + "";

		return JSUtil.nil(journalField) ? this.WORK_NOTES : journalField;
	},

	_startTriggerSubflow: function(triggeredGroupElement) {
		var triggerSubflowGr = this.triggerRuleGR.trigger_subflow.getRefRecord();
		if (JSUtil.nil(triggerSubflowGr) || !triggerSubflowGr.isValidRecord()) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[startTriggerSubflow] Trigger rule action is set to subflow but trigger_subflow field is empty");
			return;
		}

		var triggerSubflowName = triggerSubflowGr.getValue(this.INTERNAL_NAME);
		var triggerSubflowDisplayName = triggerSubflowGr.getValue(this.NAME);

		try {
			//Cancel all existing subflows and workflows on this record initiated from On-Call Trigger Rule.
			this.cancelSubflows();
			this.cancelWorkflows();

			this.subflowInputs.source_table = this.recordGR.getRecordClassName();
			this.subflowInputs.source_sys_id = this.recordGR.getUniqueValue();
			this.subflowInputs.trigger_group_field = this._getTriggerGroupField();
			this.subflowInputs.trigger_group_sys_id = triggeredGroupElement + "";
			this.subflowInputs.trigger_user_field = this._getTriggerUserField();
			this.subflowInputs.journal_field = this._getJournalField();

			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[startTriggerSubflow] subflowInputs: " + JSON.stringify(this.subflowInputs));

			// TODO: Shall we introduce new property for subflows to run in record domain ?
			var runInRecordDomain = GlidePluginManager.isActive("com.glide.domain.msp_extensions") && gs.getProperty("com.snc.on_call_rotation.trigger_workflows_in_record_domain", "false") == "true";
			var currentDomainId = gs.getSession().getCurrentDomainID() || "global"; // always the value will be 'global', as async events are processed as admin in global domain.
			var targetDomain = runInRecordDomain ? this.recordGR.getValue("sys_domain") : currentDomainId;			
			var result = sn_fd.FlowAPI.getRunner().subflow(triggerSubflowName).inBackground().inDomain(targetDomain).withInputs(this.subflowInputs).run();
			var subflowContextId = result.getContextId();
			
			if (!subflowContextId) {
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.logDebug("[startTriggerSubflow] Trigger rule subflow: " + triggerSubflowDisplayName + " did not attach to the record table: " + this.recordGR.getRecordClassName() + ", sys_id: " + this.recordGR.getUniqueValue());
				return;
			}

			this.logSubflowContext(this.recordGR.getRecordClassName(), this.recordGR.getUniqueValue(), subflowContextId, this.triggerRuleGR.getUniqueValue());

			this.recordGR.update();
		} catch (ex) {
			var message = ex.message;
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[startTriggerSubflow] interrupted due to the following error: " + message);
			else gs.error(message);
		}
	},

	_executeTriggerScript: function() {
		var triggerScript = this.triggerRuleGR.getValue(this.TRIGGER_SCRIPT);

		if (JSUtil.nil(triggerScript)) {

			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[executeTriggerScript] Trigger rule action is set to script but trigger_script field is empty");

			return;
		}

		var evaluator = new GlideScopedEvaluator();
		evaluator.putVariable("current", this.recordGR);
		evaluator.putVariable("rule", this.triggerRuleGR);
		evaluator.putVariable(this.TRIGGER_GROUP_FIELD, this._getTriggerGroupField());
		evaluator.putVariable(this.TRIGGER_USER_FIELD, this._getTriggerUserField());
		evaluator.putVariable(this.JOURNAL_FIELD, this._getJournalField());
		var result = evaluator.evaluateScript(this.triggerRuleGR, this.TRIGGER_SCRIPT);

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[_executeTriggerScript] script result: " + result);
	},

	_startTriggerWorkflow: function(triggeredGroupElement) {
		var triggerWorkflow = this.triggerRuleGR.getValue("trigger_workflow");
		if (JSUtil.nil(triggerWorkflow)) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[startWorkflow] Trigger rule action is set to workflow but trigger_workflow field is empty");
			return;
		}

		var workflowUtil = new Workflow();
		//Cancel all existing workflows and subflows on this record initiated from On-Call Trigger Rule.
		this.cancelWorkflows();
		this.cancelSubflows();

		this.workflowVars.assignment_group = triggeredGroupElement;
		this.workflowVars.trigger_group_field = this._getTriggerGroupField();
		this.workflowVars.trigger_user_field = this._getTriggerUserField();
		this.workflowVars.journal_field = this._getJournalField();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[startWorkflow] workflowVars: " + JSON.stringify(this.workflowVars));

		var runInRecordDomain = GlidePluginManager.isActive("com.glide.domain.msp_extensions") && gs.getProperty("com.snc.on_call_rotation.trigger_workflows_in_record_domain", "false") == "true";
		var currentDomain = gs.getSession().getCurrentDomainID(); // always the value will be 'global', as async events are processed as admin in global domain.
		
		/* Workflow should start from task domain - so it will have access to workflows created in both global and task domain */
		if (runInRecordDomain)
			gs.getSession().setDomainID(this.recordGR.getValue("sys_domain"));
		
		var wfContextGR = workflowUtil.startFlow(triggerWorkflow, this.recordGR, this.recordGR.operation(), this.workflowVars);
		
		/* Reset domain */
		if (runInRecordDomain)
			gs.getSession().setDomainID(currentDomain);
		
		if (!wfContextGR) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.logDebug("[startWorkflow] Trigger rule workflow: " + triggerWorkflow + " did not attach to the record table: " + this.recordGR.getRecordClassName() + ", sys_id: " + this.recordGR.getUniqueValue());
			return;
		}

		this.logWorkflowContext(this.recordGR.getRecordClassName(), this.recordGR.getUniqueValue(), wfContextGR.getUniqueValue(), this.triggerRuleGR.getUniqueValue());

		this.recordGR.update();
	},

	_getWorkflowContext: function(documentTable, documentId) {
		var gr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
		gr.addQuery(this.DOCUMENT_TABLE, documentTable);
		gr.addQuery(this.DOCUMENT, documentId);
		gr.orderByDesc(this.SYS_CREATED_ON);
		gr.setLimit(1);
		gr.query();
		if (gr.next())
			return gr;
		return null;
	},

	logWorkflowContext: function(documentTable, documentId, workflowContextId, triggerRuleSysId, parentWFContextId) {

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[logWorkflowContext] documentTable: " + documentTable + " documentId: " + documentId + " workflowContextId: " + workflowContextId + " triggerRuleSysId: " + triggerRuleSysId + " parentWFContextId: " + parentWFContextId);

		var gr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
		gr.setValue(this.DOCUMENT_TABLE, documentTable);
		gr.setValue(this.DOCUMENT, documentId);
		gr.setValue(this.TRIGGER_RULE, triggerRuleSysId);
		if (workflowContextId && gr.isValidField(this.WF_CONTEXT)) gr.setValue(this.WF_CONTEXT, workflowContextId);		
		if (parentWFContextId && gr.isValidField(this.PARENT_WF_CONTEXT)) gr.setValue(this.PARENT_WF_CONTEXT, parentWFContextId);

		var sysId = gr.insert();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[logWorkflowContext] trigger_rule_wf_context sysId: " + sysId);

		return sysId;
	},

	logSubflowContext: function(documentTable, documentId, subflowContextId, triggerRuleSysId, parentSubflowContextId) {

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[logSubflowContext] documentTable: " + documentTable + " documentId: " + documentId + " subflowContextId: " + subflowContextId + " triggerRuleSysId: " + triggerRuleSysId + " parentSubflowContextId: " + parentSubflowContextId);

		var gr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
		gr.setValue(this.DOCUMENT_TABLE, documentTable);
		gr.setValue(this.DOCUMENT, documentId);
		gr.setValue(this.TRIGGER_RULE, triggerRuleSysId);
		gr.setValue(this.SUBFLOW_CONTEXT, subflowContextId);
		if (parentSubflowContextId) gr.setValue(this.PARENT_SUBFLOW_CONTEXT, parentSubflowContextId);

		var sysId = gr.insert();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[logSubflowContext] trigger_rule_wf_context sysId: " + sysId);

		return sysId;
	},

	type: 'TriggerRuleSNC'
};
