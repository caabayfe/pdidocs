var SLATimeLineV2SNC = Class.create();
SLATimeLineV2SNC.prototype = {

	/*Tables*/
	TABLE_TASK: 'task',
	TABLE_TASK_SLA: 'task_sla',
	TABLE_CONTRACT_SLA: 'contract_sla',
	TABLE_SYS_HISTORY_LINE: 'sys_history_line',
	TABLE_CMN_SCHEDULE: 'cmn_schedule',
	TABLE_ITEM_OPTION_NEW: 'item_option_new',
	TABLE_SC_ITEM_OPTION_MTOM: 'sc_item_option_mtom',
	TABLE_SC_ITEM_OPTION: 'sc_item_option',

	/*Common Attributes*/
	ATTR_SYS_ID: 'sys_id',
	ATTR_SYS_CREATED_ON: 'sys_created_on',
	ATTR_SYS_UPDATED_ON: 'sys_updated_on',
	ATTR_SYS_MOD_COUNT: 'sys_mod_count',
	/*End common attributes*/

	/*Attributes - task_sla*/
	ATTR_TASK: 'task',
	ATTR_SLA: 'sla',
	ATTR_SCHEDULE: 'schedule',
	ATTR_STAGE: 'stage',
	ATTR_BUSINESS_PERCENTAGE: 'business_percentage',
	ATTR_BUSINESS_DURATION: 'business_duration',
	ATTR_BUSINESS_TIME_LEFT: 'business_time_left',
	ATTR_BUSINESS_PAUSE_DURATION: 'business_pause_duration',
	ATTR_PERCENTAGE: 'percentage',
	ATTR_DURATION: 'duration',
	ATTR_TIME_LEFT: 'time_left',
	ATTR_PAUSE_DURATION: 'pause_duration',
	ATTR_ACTIVE: 'active',
	ATTR_START_TIME: 'start_time',
	ATTR_ORIGINAL_BREACH_TIME: 'original_breach_time',
	ATTR_HAS_BREACHED: 'has_breached',
	ATTR_PLANNED_END_TIME: 'planned_end_time',
	/*End Attributes - task_sla*/

	/*Attributes - contract_sla*/
	ATTR_TABLE: 'table',
	ATTR_CANCEL_CONDITION: 'cancel_condition',
	ATTR_PAUSE_CONDITION: 'pause_condition',
	ATTR_RESET_CONDITION: 'reset_condition',
	ATTR_RESUME_CONDITION: 'resume_condition',
	ATTR_START_CONDITION: 'start_condition',
	ATTR_STOP_CONDITION: 'stop_condition',
	/*End attributes*/

	/*Attributes - sys_history_line*/
	ATTR_SET: 'set',
	ATTR_TYPE: 'type',
	ATTR_UPDATE: 'update',
	ATTR_UPDATE_TIME: 'update_time',
	ATTR_NEW_VALUE: 'new_value',
	ATTR_NEW: 'new',
	ATTR_FIELD: 'field',
	ATTR_LABEL: 'label',
	/*End Attributes - sys_history_line*/

	/*Attributes - contract_sla*/
	ATTR_NAME: 'name',
	ATTR_COLLECTION: 'collection',
	ATTR_URL: 'url',
	/*End Attributes - contract_sla*/

	/*Field types*/
	FIELD_TYPE_WF: 'workflow',
	FIELD_TYPE_JOURNAL_INPUT: 'journal_input',
	/*Field types

	/*Attributes - task variables*/
	ATTR_REQUEST_ITEM: 'request_item',
	ATTR_QUESTION_TEXT: 'question_text',
	/*Attributes - task variables*/

	/*Operators*/
	OPR_IN: 'IN',
	/*End Operators*/

	/*Configuration*/
	SLA_TIME_LINE_LOG: 'com.snc.sla.time_line.log',
	SLA_ENGINE_VERSION: 'com.snc.sla.engine.version',
	LAND_MARK_PERCENTAGES: [50, 75, 100], //These percentage stages are inserted if updates do not happen at this exact stage
	/*End Configuration*/

	/*TASK_SLA STAGES*/
	SLA_STAGE_COMPLETED: 'completed',
	SLA_STAGE_CANCELLED: 'cancelled',
	SLA_STAGE_IN_PROGRESS: 'in_progress',
	SLA_STAGE_BREACHED: 'breached',
	/*End TASK_SLA STAGES*/

	/*Properties*/
	PROP_2010_BACK_COMPATIBILITY: 'com.snc.sla.compatibility.breach',
	PROP_TASK_UPDATE_LIMIT: 'com.snc.sla.timeline.task_update_limit',
	PROP_TASK_UPDATE_THRESHOLD: 'com.snc.sla.timeline.task_update_threshold',
	/*End Properties*/

	/*User Preference*/
	PREF_SHOW_ALL_TASK_UPDATES: 'com.snc.sla.timeline.show_all_task_updates',
	/*End User Preference*/

	initialize: function(params) {
		this.arrayUtil = new ArrayUtil();
		this.slaUtil = new SLAUtil();
		this.hwWithJournals = false;
		this.hwWithSysFields = false;
		this.hwWithVariables = false;

		this.conditionFields = [
			this.ATTR_CANCEL_CONDITION,
			this.ATTR_PAUSE_CONDITION,
			this.ATTR_RESET_CONDITION,
			this.ATTR_RESUME_CONDITION,
			this.ATTR_START_CONDITION,
			this.ATTR_STOP_CONDITION
		];

		this.log = new GSLog(this.SLA_TIME_LINE_LOG, this.type);
                this.log.includeTimestamp();

		if (gs.getProperty(this.PROP_2010_BACK_COMPATIBILITY, 'false') === 'true')
			this.isBackwardCompatibility2010Enabled = true;
		else
			this.isBackwardCompatibility2010Enabled = false;

		this.TASK_UPDATE_LIMIT = parseInt(gs.getProperty(this.PROP_TASK_UPDATE_LIMIT, 12500));
		this.TASK_UPDATE_THRESHOLD = parseInt(gs.getProperty(this.PROP_TASK_UPDATE_THRESHOLD, 1000));

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[initialize] params: " + JSON.stringify(params, null, 2));

		if (params) {
			if (params.getTaskSlaGroupedBySla)
				this.GET_TASK_SLA_GROUPED_BY_SLA = true;
			if (params.getDBTaskSlasAsStored)
				this.GET_DB_TASK_SLAS_AS_STORED = true;
			if (params.getTaskFullDetails)
				this.GET_TASK_FULL_DETAILS = true;
			if (params.getAllStages)
				this.GET_ALL_STAGES = true;
		}
	},

	/*
	 ** This will be the function primarily responsible for preparing results of timeline
	 ** details for SLA with query starting from a Task.
	 **
	 ** From REST API we might always end up hitting this API with a single task and the
	 ** filtering on SLAs will be done on client side. However, we still provide a support to have the filter
	 ** at server side for which we very well may have the need for other cases.
	 **
	 */
	getTimeLineDetails: function(taskId /*String - Mandatory*/ , contractSLAIds /*Array*/ ) {
		var taskGr = new GlideRecord(this.TABLE_TASK);

		if (!taskId || !taskGr.get(taskId))
			return this._returnApiError(gs.getMessage('A valid task record is necessary to get timeline details'));

		taskGr = this.getRecordWithClass(taskGr, taskId); //Fetching record with it's own class
		var preConditions = this._apiPreConditionsCheck(taskGr);
		if (preConditions.apiError || preConditions.apiSecurityError)
			return preConditions;

		return this._getTimeLineDetails(taskGr, contractSLAIds.filter(function(el) { return el; }));
	},

	getRecordWithClass: function(taskGr, taskId) {
		var recordClassName = taskGr.getRecordClassName();
		taskGr = new GlideRecord(recordClassName);
		taskGr.get(taskId);
		return taskGr;
	},

	_apiPreConditionsCheck: function(taskGr) {
		if (gs.getProperty(this.SLA_ENGINE_VERSION, '2010') !== '2011')
			return this._returnApiError(gs.getMessage("This feature is only supported while running the 2011 Engine."));

		if (!(new GlideAuditor(taskGr.getRecordClassName(), null).auditTable()))
			return this._returnApiError(gs.getMessage("Audit is not enabled on this table. Timeline details can't be extracted."));

		if (!taskGr.canRead())
			return this._returnApiSecurityError(gs.getMessage("Security constraints don't allow to view this timeline as read access is not available for this {0}", taskGr.getRecordClassName()));
	},

	_returnApiError: function(message) {
		return { apiError: message };
	},

	_returnApiSecurityError: function(message) {
		return {
			apiSecurityError: message
		};
	},

	_getTaskObj: function(taskGr) {
		var taskObj = {};
		if (this.GET_TASK_FULL_DETAILS)
			taskObj = this.slaUtil.grToJsObj(taskGr);

		if ((taskObj.hasOwnProperty('read_allowed') && taskObj.read_allowed) || !taskObj.hasOwnProperty('read_allowed')) {
			taskObj.sys_id = taskGr.getUniqueValue();
			if (taskGr.getDisplayName() && taskGr.getElement(taskGr.getDisplayName()).canRead())
				taskObj.display_value = taskGr.getDisplayValue();
			else
				taskObj.display_value = '';
			taskObj.url = taskGr.getLink(true);
			taskObj.sys_class_name = taskGr.getRecordClassName();
		}
		return taskObj;
	},

	// Check SLA Definition conditions use Journal Conditions or contain variables
	_setHistoryWalkerParms: function(contractSLAData) {
		if (!contractSLAData)
			return;

		if (contractSLAData && contractSLAData.gr && contractSLAData.gr.hasNext()) {
			while (contractSLAData.gr.next()) {
				if (!this.hwWithJournals && this.slaUtil.hasAdvancedJournalCondition(contractSLAData.gr))
					this.hwWithJournals = true;

				if (!this.hwWithVariables && this.slaUtil.hasVariablesCondition(contractSLAData.gr))
					this.hwWithVariables = true;

				if (!this.hwWithSysFields && this.slaUtil.hasAdvancedSysFieldCondition(contractSLAData.gr))
					this.hwWithSysFields = true;

				if (this.hwWithJournals && this.hwWithVariables && this.hwWithSysFields)
					break;
			}
			contractSLAData.gr.restoreLocation();
		}

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_setHistoryWalkerParms] hwWithJournals: " + this.hwWithJournals + " hwWithVariables: " + this.hwWithVariables + " hwWithSysFields: " + this.hwWithSysFields);
	},

	_getTimeLineDetails: function(taskGr, contractSLAIds) {

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_getTimeLineDetails] contractSLAIds: " + contractSLAIds);

		var taskSLAGr = new GlideRecord(this.TABLE_TASK_SLA);
		taskSLAGr.addQuery(this.ATTR_TASK, taskGr.getUniqueValue());
		if (Array.isArray(contractSLAIds) && contractSLAIds.length > 0)
			taskSLAGr.addQuery(this.ATTR_SLA, this.OPR_IN, contractSLAIds.join(','));
		taskSLAGr.query();

		var taskSLAsCurrentStateInDb = this.slaUtil.grToJsArr(taskSLAGr);

		var contractSLAData = this._getContractSLARecs(taskSLAsCurrentStateInDb, contractSLAIds, taskGr);

		this._setHistoryWalkerParms(contractSLAData);

		var taskSlasWorkedOut = this._prepareTaskSLAsForContractSLAs(contractSLAData, taskGr);

		var timeLineDetails = {
			task_delta_changes: taskSlasWorkedOut.taskDeltaChanges,
			task_full_snap_at_updates: taskSlasWorkedOut.taskFullSnapAtUpdates,
			task_slas_worked_out_attached_contracts: taskSlasWorkedOut.attached,
			task_slas_worked_out_simulated_contracts: taskSlasWorkedOut.simulated,
			contract_slas: taskSlasWorkedOut.contractSlas,
			task_details: this._getTaskObj(taskGr),
			task_reference_field_value_map: this._getTaskRefFieldValueMap(taskSlasWorkedOut.contractSlas, taskGr),
			taskThresholdReached: taskSlasWorkedOut.taskThresholdReached,
			taskHistoryLimitExceeded: taskSlasWorkedOut.taskHistoryLimitExceeded
		};

		if (this.GET_DB_TASK_SLAS_AS_STORED)
			timeLineDetails.task_slas_current_state_db = taskSLAsCurrentStateInDb;

		return timeLineDetails;
	},

	_getTaskRefFieldValueMap: function(contractSlas, taskGr) {
		var taskRefFieldValueMap = {};
		var variablesReadOnly = !taskGr.variables.canRead();
		var variablesPrefix = "variables.";

		for (var i = 0; i < contractSlas.length; i++) {
			var contractSla = contractSlas[i];
			var relatedFieldsForContractSla = [];

			this.conditionFields.forEach(function(conditionField) {
				relatedFieldsForContractSla = this.arrayUtil.concat(relatedFieldsForContractSla, contractSla[conditionField].related_fields);
			}, this);

			for (var j = 0; j < relatedFieldsForContractSla.length; j++) {
				if (relatedFieldsForContractSla[j].indexOf('.') > -1 && !taskRefFieldValueMap.hasOwnProperty(relatedFieldsForContractSla[j])) {
					var queryPart = relatedFieldsForContractSla[j];
					var splitField = queryPart.split('.');
					var dottedElement;
					var dottedElementLabel;
					var relatedFieldMap = {};
					if (relatedFieldsForContractSla[j].startsWith(variablesPrefix)) {
						var variableId = relatedFieldsForContractSla[j].substr(variablesPrefix.length);
						var variableElement = taskGr.variables[variableId];
						if (!variableElement)
							continue;

						relatedFieldMap.variable_name = variableElement.getName();
						relatedFieldMap.read_allowed = variablesReadOnly;
						relatedFieldMap.label = variableElement.getQuestion().getLabel();
						relatedFieldMap.value = variablesReadOnly ? '' : variableElement.getValue();
						relatedFieldMap.display_value = variablesReadOnly ? gs.getMessage('(restricted)') : variableElement.getDisplayValue();
					} else {
						for (var k = 0; k < splitField.length; k++) {//Go n level deep to find value
							if (k === 0)
								dottedElement = taskGr[splitField[k]];
							else
								dottedElement = dottedElement[splitField[k]];
						}
						//To form a valid query append '=' and then use the first part to get label of the query. Done to rely on platform API
						var readableQuery = new GlideQueryBreadcrumbs().getReadableQuery(taskGr.getTableName(), queryPart + '=');
						if (readableQuery)
							dottedElementLabel = readableQuery.split('=')[0].trim();
						else
							dottedElementLabel = '';
						if (dottedElement.canRead()) {
							relatedFieldMap.read_allowed = true;
							relatedFieldMap.label = dottedElementLabel;
							relatedFieldMap.value = dottedElement.getValue();
							relatedFieldMap.display_value = dottedElement.getDisplayValue();
						} else {
							relatedFieldMap.read_allowed = false;
							relatedFieldMap.label = dottedElementLabel;
							relatedFieldMap.value = '';
							relatedFieldMap.display_value = gs.getMessage('(restricted)');
						}
					}
					taskRefFieldValueMap[relatedFieldsForContractSla[j]] = relatedFieldMap;
				}
			}
		}
		return taskRefFieldValueMap;
	},

	_getAllRelatedFields: function(contractSlas) {
		var relatedFieldsForContractSla = [];

		contractSlas.forEach(function(contractSla) {
			this.conditionFields.forEach(function(conditionField) {
				relatedFieldsForContractSla = this.arrayUtil.concat(relatedFieldsForContractSla, contractSla[conditionField].related_fields);
			}, this);
		}, this);

		relatedFieldsForContractSla = this.arrayUtil.unique(relatedFieldsForContractSla);

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_getAllRelatedFields] relatedFieldsForContractSla: " + JSON.stringify(relatedFieldsForContractSla, null, 2));

		return relatedFieldsForContractSla;
	},

	_getContractSlaData: function(contractSlaGr) {
		var contractSlas = [];

		if (!contractSlaGr)
			return contractSlas;

		while (contractSlaGr.next())
				contractSlas.push(this._prepareContractSLAData(contractSlaGr));

		// Needs to be traversed again
		contractSlaGr.restoreLocation();

		return contractSlas;
	},

	_prepareTaskSLAsForContractSLAs: function(contractSla, taskGr) {

		var taskSlasWorkedOut = {
			contractSlas: [],
			attached: this.GET_TASK_SLA_GROUPED_BY_SLA ? {} : [],
			simulated: this.GET_TASK_SLA_GROUPED_BY_SLA ? {} : [],
			taskDeltaChanges: [],
			taskFullSnapAtUpdates: [],
			taskThresholdReached: false,
			taskHistoryLimitExceeded: false
		};

		if (!contractSla || !contractSla.gr)
			return taskSlasWorkedOut;

		if (this._exceedsHistoryLimit(taskGr)) {
			taskSlasWorkedOut.taskHistoryLimitExceeded = true;
			return taskSlasWorkedOut;
		}

		taskSlasWorkedOut.contractSlas = this._getContractSlaData(contractSla.gr);
		var contractSlaRelatedFields = this._getAllRelatedFields(taskSlasWorkedOut.contractSlas);
		var taskSlaGroupedBySla = this.getTaskSLABreakDowns(taskGr, contractSla.gr, contractSlaRelatedFields, taskSlasWorkedOut);

		if (!taskSlaGroupedBySla)
			return taskSlasWorkedOut;

		// Populate attached and simulated arrays/objects
		Object.keys(taskSlaGroupedBySla).forEach(function(contractSlaSysId) {
			var obj = contractSla.attached.indexOf(contractSlaSysId) !== -1 ? taskSlasWorkedOut.attached : taskSlasWorkedOut.simulated;
			if (this.GET_TASK_SLA_GROUPED_BY_SLA)
				obj[contractSlaSysId] = taskSlaGroupedBySla[contractSlaSysId].taskSLAs;
			else
				obj = this.arrayUtil.concat(obj, taskSlaGroupedBySla[contractSlaSysId].taskSLAs);
		}, this);

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_getTimeLineDetails] taskSlasWorkedOut: " + JSON.stringify(taskSlasWorkedOut, null, 2));

		return taskSlasWorkedOut;
	},

	_exceedsHistoryLimit: function(taskGr) {
		var rowCount = 0;
		var auditGa = new GlideAggregate("sys_audit");
		auditGa.addQuery("documentkey", taskGr.getUniqueValue());
		auditGa.groupBy("record_checkpoint");
		auditGa.addAggregate("COUNT");
		auditGa.query();
		if (auditGa.next())
			rowCount = auditGa.getAggregate("COUNT");

		var exceedsHistoryLimit = rowCount > this.TASK_UPDATE_LIMIT;

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_exceedsHistoryLimit] rowCount: " + rowCount + " exceedsHistoryLimit: " + exceedsHistoryLimit);

		return exceedsHistoryLimit;
	},

	_prepareContractSLAData: function(contractSLAGr) {
		var contractSLAObj = this.slaUtil.grToJsObj(contractSLAGr, true);
		if (contractSLAObj.read_allowed) {
			this.conditionFields.forEach(function(conditionField) {
				if (contractSLAGr.getValue(conditionField))
					contractSLAObj[conditionField].related_fields = this.slaUtil.getRelatedFieldsFromEncodedQuery(contractSLAGr.getValue(this.ATTR_COLLECTION), contractSLAGr.getValue(conditionField));
			}, this);
		}

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_prepareContractSLAData] contractSLAObj: " + JSON.stringify(contractSLAObj, null, 2));

		return contractSLAObj;
	},

	_getTaskUpdate: function(walkedRecordGr) {
		var taskUpdate = {};
		taskUpdate.update = walkedRecordGr.getValue(this.ATTR_SYS_MOD_COUNT);
		if (parseInt(taskUpdate.update) === 0)
			taskUpdate[this.ATTR_SYS_CREATED_ON] = walkedRecordGr[this.ATTR_SYS_CREATED_ON].getGlideObject().getDisplayValueInternal();
		taskUpdate[this.ATTR_SYS_UPDATED_ON] = walkedRecordGr[this.ATTR_SYS_UPDATED_ON].getGlideObject().getDisplayValueInternal();
		this._addChangedFields(walkedRecordGr, taskUpdate);
		this._addChangedVariables(walkedRecordGr, taskUpdate);
		this._addDateMapNonGrFields(taskUpdate, [this.ATTR_SYS_UPDATED_ON, this.ATTR_SYS_CREATED_ON]);
		return taskUpdate;
	},

	_getFullSnapshot: function(walkedRecordGr, contractSlaRelatedFields) {
		var jsObj = this.slaUtil.grToJsObj(walkedRecordGr);
		var fullSnap = {};
		for (var fieldName in jsObj)
			if (fieldName.startsWith('sys_') || fieldName.startsWith('variables') || this.arrayUtil.contains(contractSlaRelatedFields, fieldName))
				fieldName.startsWith('variables.') ? fullSnap[fieldName] = jsObj["variables"] : fullSnap[fieldName] = jsObj[fieldName];

		return fullSnap;
	},

	_getTaskSLABreakDowns: function(taskGr, walkedRecordGr, previousWalkedRecordGr, lastUpdate, params, finalHistoryUpdate) {
		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_getTaskSLABreakDowns] walkedRecordGr.original_sys_id: " + walkedRecordGr.original_sys_id + " modCount: " + walkedRecordGr.sys_mod_count);

		if (!params.taskSLA)
			params.taskSLA = params.taskSLAController.initNewTaskSLA(walkedRecordGr, params.contractSLAGr);
		else if (params.taskSLA) {
			params.prevTaskSLA = params.taskSLAController.copyTaskSLA(params.contractSLAGr, previousWalkedRecordGr, this.slaUtil.copyGlideRecord(params.taskSLA.taskSLAgr), params.taskSLA.retroactivePauseData);
			params.taskSLA = params.taskSLAController.updateTaskSLA(walkedRecordGr, params.taskSLA, params.contractSLAGr);
		}

		if (params.taskSLA) {
			var taskSLADummyGr = params.taskSLA.getGlideRecord();
			if (taskSLADummyGr.getValue(this.ATTR_STAGE)) {

				// This block is for when SLA has start time later than task update date
				if (this._isSlaStartAfterTaskUpdate(taskSLADummyGr, walkedRecordGr)) {

					if (params.preStartSLAStages.length === 0) {
						params.attachedDate = walkedRecordGr.sys_updated_on.getGlideObject().getDisplayValueInternal();
						params.preStartSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, undefined, walkedRecordGr));
					} else
						params.preStartSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, params.preStartSLAStages[params.preStartSLAStages.length - 1], walkedRecordGr));

					if (this.log.atLevel(GSLog.DEBUG))
						this.log.debug("[_getTaskSLABreakDowns] params.preStartSLAStages: " + JSON.stringify(params.preStartSLAStages, null, 2));

					this._trackIfUpdateWasResponsibleForStageChange(params.preStartSLAStages, params.stateChangeOccuredDueToUpdates, walkedRecordGr, true);

					params.isTerminalStageUpdate = parseInt(taskSLADummyGr.getValue(this.ATTR_ACTIVE)) === 0;
					if (params.isTerminalStageUpdate || lastUpdate) {
						params.isReset = params.taskSLA.isReset;
						if (params.preStartSLAStages && params.preStartSLAStages.length > 0 && params.isReset)
							params.preStartSLAStages[params.preStartSLAStages.length - 1].values_at_evaluation_date.is_reset = params.isReset;

						this._prepareFutureTaskSLA(params.contractSLAGr, params.preStartSLAStages, params.stateChangeOccuredDueToUpdates, params.taskSLAs, params.attachedDate, params.countOfTaskSlas++);
						params.taskSLAController = new ReadOnlyTaskSLAController();
						params.taskSLA = null;
						params.attachedDate = null;
						params.taskSLAStages = [];
						params.preStartSLAStages = [];
						params.landMarkPercentageCount = 0;
						params.stateChangeOccuredDueToUpdates = [];
						params.prevTaskSLA = null;
						params.startedFromReset = null;

						if (this.log.atLevel(GSLog.DEBUG))
							this.log.debug("[_getTaskSLABreakDowns] params.isReset: " + params.isReset);

						if (params.isReset) {
							params.taskSLA = params.taskSLAController.initNewTaskSLA(walkedRecordGr, params.contractSLAGr);
							if (params.taskSLA) {
								params.taskSLADummyGrReset = params.taskSLA.getGlideRecord();
								params.preStartSLAStages.push(this._prepareTaskSLAStage(params.taskSLADummyGrReset, undefined, walkedRecordGr));
								this._trackIfUpdateWasResponsibleForStageChange(params.preStartSLAStages, params.stateChangeOccuredDueToUpdates, walkedRecordGr, true);
							}
						}
					}
				}
				// This block is for when start time is before or equal to task update date
				else {
					if (params.taskSLAStages.length === 0)
						params.taskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, undefined, walkedRecordGr));
					else
						params.taskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, params.taskSLAStages[params.taskSLAStages.length - 1], walkedRecordGr));

					if (this._trackIfUpdateWasResponsibleForStageChange(params.taskSLAStages, params.stateChangeOccuredDueToUpdates, walkedRecordGr))
						params.taskSLAStages[params.taskSLAStages.length - 1].mustHaveStage = true;

					if (this.log.atLevel(GSLog.DEBUG))
						this.log.debug("[_getTaskSLABreakDowns] params.taskSLAStages: " + JSON.stringify(params.taskSLAStages, null, 2));

					// Populate the date when the params.taskSLA was attached
					if (params.taskSLAStages.length === 1) {
						params.attachedDate = walkedRecordGr.sys_updated_on.getGlideObject().getDisplayValueInternal();
						params.walkedRecordGr = walkedRecordGr;
						if (params.attachedDate > taskSLADummyGr.start_time.getGlideObject().getDisplayValueInternal())
							this._insertRetroactiveStages(params);
					}

					params.prevTaskGr = this.slaUtil.copyGlideRecord(previousWalkedRecordGr);

					// Evaluate and insert the stages where land mark business percentages like 50, 75, 100 were crossed at correct positions.
					this._insertLandMarkStages(params);

					params.isTerminalStageUpdate = parseInt(taskSLADummyGr.getValue(this.ATTR_ACTIVE)) === 0;
					if (params.isTerminalStageUpdate || lastUpdate) {
						params.taskSLAStages[params.taskSLAStages.length - 1].mustHaveStage = true;
						params.isReset = params.taskSLA.isReset;
						if (params.taskSLAStages) {
							if (params.isReset)
								params.taskSLAStages[params.taskSLAStages.length - 1].values_at_end_date.is_reset = params.isReset;

							this._prepareTaskSLA(params.contractSLAGr, params.taskSLAStages, params.stateChangeOccuredDueToUpdates, params.taskSLAs, params.attachedDate, walkedRecordGr, params.countOfTaskSlas++, null, params.startedFromReset);
						}

						//clear task_sla to evaluate if it gets reattached or restarted cause of future updates.
						params.taskSLAController = new ReadOnlyTaskSLAController();
						params.taskSLA = null;
						params.attachedDate = null;
						params.taskSLAStages = [];
						params.preStartSLAStages = [];
						params.landMarkPercentageCount = 0;
						params.stateChangeOccuredDueToUpdates = [];
						params.prevTaskSLA = null;
						params.startedFromReset = null;

						if (this.log.atLevel(GSLog.DEBUG))
							this.log.debug("[_getTaskSLABreakDowns] params.isReset: " + params.isReset);

						if (params.isReset) {
							params.taskSLA = params.taskSLAController.initNewTaskSLA(walkedRecordGr, params.contractSLAGr);
							if (params.taskSLA) {
								params.taskSLADummyGrReset = params.taskSLA.getGlideRecord();
								params.taskSLAStages.push(this._prepareTaskSLAStage(params.taskSLADummyGrReset, undefined, walkedRecordGr));
								if (this._trackIfUpdateWasResponsibleForStageChange(params.taskSLAStages, params.stateChangeOccuredDueToUpdates, walkedRecordGr))
									params.taskSLAStages[params.taskSLAStages.length - 1].mustHaveStage = true;
								params.attachedDate = walkedRecordGr.sys_updated_on.getGlideObject().getDisplayValueInternal();
								params.startedFromReset = {
									taskSLA_text: params.taskSLAs[params.taskSLAs.length - 1].text,
									taskSLA_id: params.taskSLAs[params.taskSLAs.length - 1].id
								};

								params.walkedRecordGr = walkedRecordGr;
								if (params.attachedDate > params.taskSLADummyGrReset.start_time.getGlideObject().getDisplayValueInternal())
									this._insertRetroactiveStages(params);

								if (finalHistoryUpdate) {
									//The update that caused the reset is the last update and so we now need to evaluate the SLA based on the current date/time
									params.prevTaskSLA = params.taskSLAController.copyTaskSLA(params.contractSLAGr, walkedRecordGr, this.slaUtil.copyGlideRecord(params.taskSLA.taskSLAgr), params.taskSLA.retroactivePauseDataList);
									params.taskSLA = params.taskSLAController.updateTaskSLA(params.pseudoTaskGr, params.taskSLA, params.contractSLAGr);
									var taskSLADummyGrResetPseudoUpdate = params.taskSLA.getGlideRecord();
									//At this stage the pseudo update is again going to complete the SLA as it has not moved out of Reset so just stamp to the stage it was before
									this._revertAttributes(taskSLADummyGrResetPseudoUpdate, params.taskSLAStages[params.taskSLAStages.length - 1]);
									params.taskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGrResetPseudoUpdate, params.taskSLAStages[params.taskSLAStages.length - 1], params.pseudoTaskGr));
									params.taskSLAStages[params.taskSLAStages.length - 1].mustHaveStage = true;
									params.landMarkPercentageCount = this._insertLandMarkStages(params, false);
									this._prepareTaskSLA(params.contractSLAGr, params.taskSLAStages, params.stateChangeOccuredDueToUpdates, params.taskSLAs, params.attachedDate, taskGr, params.countOfTaskSlas++, null, params.startedFromReset);
								}
							}
						}
					}
				}
			}
		}
	},

	getTaskSLABreakDowns: function(taskGr, contractSLAGr, contractSlaRelatedFields, taskSlasWorkedOut) {
		var walkedRecordGr;
		var previousWalkedRecordGr;
		var lastUpdate = false;

		var hw = this.slaUtil.getHistoryWalker(
			taskGr.getRecordClassName(),
			taskGr.getValue('sys_id'),
			/*recordLevelSecurity*/ false,
			/*fieldLevelSecurity*/ false,
			/*withVariables*/ this.hwWithVariables,
			/*walkToFirstUpdate*/ false,
			/*withJournalFields*/ this.hwWithJournals,
			/*withSysFields*/ this.hwWithSysFields
		);

		if (!hw)
			return;

		// Get the latest update for our task
		hw.walkBackward();

		// We may need this "pseudo" copy of the Task which is basically the current task but with the update time set to now
		var pseudoTaskGr = hw.getWalkedRecordCopy();
		pseudoTaskGr.setValue(this.ATTR_SYS_UPDATED_ON, new GlideDateTime().getValue());
		pseudoTaskGr.original_sys_id = walkedRecordGr.getUniqueValue();

		var taskSlaGroupedBySla = {};
		while(contractSLAGr.next()) {
			taskSlaGroupedBySla[contractSLAGr.getUniqueValue()] = {
				contractSLAGr: this.slaUtil.copyGlideRecord(contractSLAGr),
				taskSLAStages: [],
				taskSLAs: [],
				taskSLA: null,
				taskSLAController: new ReadOnlyTaskSLAController(),
				countOfTaskSlas: 1,
				stateChangeOccuredDueToUpdates: [],
				attachedDate: null,
				landMarkPercentageCount: 0,
				prevTaskSLA: null,
				preStartSLAStages: [],
				isTerminalStageUpdate: false,
				startedFromReset: null,
				isReset: null,
				taskSLADummyGrReset: null,
				taskSLACopy: null,
				retroactiveStagesObj: null,
				retroactiveTaskSLAStages: [],
				taskSLADummyGrResetPseudoUpdate: null,
				pseudoTaskGr: pseudoTaskGr
			};
		}

		// Now go to update 0 so we can start walking through the updates
		if (!hw.walkTo(0))
			return;

		var userPrefAllTaskUpdates = gs.getUser().getPreference(this.PREF_SHOW_ALL_TASK_UPDATES);
		var taskUpdatesCounter = 0;

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[getTaskSLABreakDowns] userPrefAllTaskUpdates: " + userPrefAllTaskUpdates);

		// Checking the mod count is not sufficient as processes can update the record with setWorkflow(false)
		var maxUpdateCount = this.slaUtil.getMaxUpdateCount(taskGr.getRecordClassName(), taskGr.getUniqueValue());

		do {
			// Process the taskSla by walking the task history
			walkedRecordGr = hw.getWalkedRecord();
			walkedRecordGr.original_sys_id = taskGr.getUniqueValue();

			var slaConditionFieldChanged = this._hasSlaConditionFieldChanged(contractSlaRelatedFields, walkedRecordGr);

			if (slaConditionFieldChanged || (userPrefAllTaskUpdates && taskUpdatesCounter < this.TASK_UPDATE_THRESHOLD)) {
				taskSlasWorkedOut.taskDeltaChanges.push(this._getTaskUpdate(walkedRecordGr));
				taskSlasWorkedOut.taskFullSnapAtUpdates.push(this._getFullSnapshot(walkedRecordGr, contractSlaRelatedFields));

				// increment number of task updates that have no effect on SLA
				if (userPrefAllTaskUpdates && !slaConditionFieldChanged) {
					taskUpdatesCounter++;
					taskSlasWorkedOut.taskThresholdReached = taskUpdatesCounter >= this.TASK_UPDATE_THRESHOLD;
				}
			}

			var updateNumber = hw.getUpdateNumber();
			Object.keys(taskSlaGroupedBySla).forEach(function(contractSlaSysId) {
				this._getTaskSLABreakDowns(taskGr, walkedRecordGr, previousWalkedRecordGr, lastUpdate, taskSlaGroupedBySla[contractSlaSysId], maxUpdateCount === updateNumber);
			}, this);

			previousWalkedRecordGr = hw.getWalkedRecordCopy();
		} while (hw.walkForward());

		// Process the pseudo record
		if (pseudoTaskGr === null)
			return taskSlaGroupedBySla;

		Object.keys(taskSlaGroupedBySla).forEach(function(contractSlaSysId) {
			if (!taskSlaGroupedBySla[contractSlaSysId].isTerminalStageUpdate)
				this._getTaskSLABreakDowns(taskGr, pseudoTaskGr, previousWalkedRecordGr, true, taskSlaGroupedBySla[contractSlaSysId]);
		}, this);

		return taskSlaGroupedBySla;
	},

	_hasSlaConditionFieldChanged: function(contractSlaRelatedFields, walkedRecordGr) {
		var changedFieldNames = GlideScriptRecordUtil.get(walkedRecordGr).getChangedFieldNames();
		for (var i = 0; i < contractSlaRelatedFields.length; i++)
			if (changedFieldNames.indexOf(contractSlaRelatedFields[i]) > -1)
				return true;
		return false;
	},

	//function to revert reset/retroactive stage to before for pseudo updates as re-evaluation of reset will complete the sla or retroactive could stamp false stage
	//while this update is not a real one
	_revertAttributes: function(taskSLADummyGrPseudoUpdate, prevStage) {
		//retroactives can occur before creation date. So at that time the TaskSLA API could return false stage of cancelled or any other stage as per the Task value at that time. So ignore them.
		if (this.isBackwardCompatibility2010Enabled && parseInt(taskSLADummyGrPseudoUpdate.getValue(this.ATTR_HAS_BREACHED)) === 1)
			taskSLADummyGrPseudoUpdate.setValue(this.ATTR_STAGE, this.SLA_STAGE_BREACHED);
		else
			taskSLADummyGrPseudoUpdate.setValue(this.ATTR_STAGE, prevStage.values_at_end_date[this.ATTR_STAGE].value);
		taskSLADummyGrPseudoUpdate.setValue(this.ATTR_ACTIVE, prevStage.values_at_end_date[this.ATTR_ACTIVE].value);
	},

	_isSlaStartAfterTaskUpdate: function(taskSLAGr, taskGr) {
		var taskUpdateTime = taskGr.sys_updated_on.getGlideObject().getDisplayValueInternal();
		var taskSlaStartTime = taskSLAGr.start_time.getGlideObject().getDisplayValueInternal();
		var isSlaStartAfterTaskUpdate = taskUpdateTime < taskSlaStartTime;

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_isSlaStartAfterTaskUpdate] taskSlaStartTime: " + taskSlaStartTime + " taskUpdateTime: " + taskUpdateTime + " isSlaStartAfterTaskUpdate: " + isSlaStartAfterTaskUpdate);

		return isSlaStartAfterTaskUpdate;
	},

	_trackIfUpdateWasResponsibleForStageChange: function(taskSLAStages, stateChangeOccuredDueToUpdates, taskDummyGrCurrent, isFuture) {
		var stageChanged = false;
		//determine if this update was responsible for changing the state of this task_sla. For first stage always
		//add to the stateChangeOccuredDueToUpdates as this update moved the task_sla to starting
		if (taskSLAStages.length === 1)
			stageChanged = true;

		if (taskSLAStages.length > 1) {
			var prevStage;
			var currentStage;
			if (isFuture)
				prevStage = taskSLAStages[taskSLAStages.length - 2].values_at_evaluation_date.stage.value;
			else
				prevStage = taskSLAStages[taskSLAStages.length - 2].values_at_end_date.stage.value;
			if (isFuture)
				currentStage = taskSLAStages[taskSLAStages.length - 1].values_at_evaluation_date.stage.value;
			else
				currentStage = taskSLAStages[taskSLAStages.length - 1].values_at_end_date.stage.value;

			var updateBasedStageChange = (prevStage !== currentStage && !(prevStage == this.SLA_STAGE_IN_PROGRESS && currentStage == this.SLA_STAGE_BREACHED));
			var updateBasedTerminalStageChange;

			if (isFuture)
				updateBasedTerminalStageChange = (taskSLAStages[taskSLAStages.length - 1].values_at_evaluation_date.active.value !== taskSLAStages[taskSLAStages.length - 2].values_at_evaluation_date.active.value);
			else
				updateBasedTerminalStageChange = (taskSLAStages[taskSLAStages.length - 1].values_at_end_date.active.value !== taskSLAStages[taskSLAStages.length - 2].values_at_end_date.active.value);

			if (updateBasedTerminalStageChange || updateBasedStageChange)
				stageChanged = true;
		}

		if (stageChanged)
			stateChangeOccuredDueToUpdates.push(taskDummyGrCurrent.getValue(this.ATTR_SYS_MOD_COUNT));

		return stageChanged;
	},

	_insertRetroactiveStages: function(params) {
		params.taskSLACopy = params.taskSLAController.copyTaskSLA(params.contractSLAGr, params.walkedRecordGr, this.slaUtil.copyGlideRecord(params.taskSLA.taskSLAgr), params.taskSLA.retroactivePauseDataList);

		if (!params.taskSLAStages || !params.taskSLAStages[0])
			return;

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_insertRetroactiveStages] taskSLAStages: " + JSON.stringify(params.taskSLAStages, null, 2));

		var attachedStageObj = params.taskSLAStages[0];
		var landMarkPercentageCount = 0;
		var attachedStage = attachedStageObj.values_at_end_date;
		var schedule = this.slaUtil.getSchedule(params.contractSLAGr, params.walkedRecordGr);
		var startTimeGdt = new GlideDateTime(attachedStage[this.ATTR_START_TIME].value);
		var originalBreachTimeGdt = new GlideDateTime(attachedStage[this.ATTR_ORIGINAL_BREACH_TIME].value);
		var totalDurMS = 0;
		/*
		 * Original breach time is the time when the SLA started and it was the 100% mark. So rely on it.
		 */
		if (schedule && schedule.getID()) {
			var totalDur = schedule.duration(startTimeGdt, originalBreachTimeGdt);
			totalDurMS = new GlideDateTime(totalDur.getValue()).getNumericValue();
		} else
			totalDurMS = originalBreachTimeGdt.getNumericValue() - startTimeGdt.getNumericValue();

		var retroactivePauseDataList = params.taskSLACopy.retroactivePauseDataList;

		//create a stage at 0 progress at start_time
		var taskSLADummyGr = params.taskSLACopy.getGlideRecord();
		taskSLADummyGr.setValue(this.ATTR_DURATION, new GlideDuration(0));
		taskSLADummyGr.setValue(this.ATTR_BUSINESS_DURATION, new GlideDuration(0));
		taskSLADummyGr.setValue(this.ATTR_PAUSE_DURATION, new GlideDuration(0));
		taskSLADummyGr.setValue(this.ATTR_BUSINESS_PAUSE_DURATION, new GlideDuration(0));
		taskSLADummyGr.setValue(this.ATTR_PAUSE_TIME, '');
		taskSLADummyGr.setValue(this.ATTR_TIME_LEFT, new GlideDuration(totalDurMS));
		taskSLADummyGr.setValue(this.ATTR_BUSINESS_TIME_LEFT, new GlideDuration(totalDurMS));
		taskSLADummyGr.setValue(this.ATTR_PERCENTAGE, 0);
		taskSLADummyGr.setValue(this.ATTR_BUSINESS_PERCENTAGE, 0);
		taskSLADummyGr.setValue(this.ATTR_HAS_BREACHED, false);
		taskSLADummyGr.setValue(this.ATTR_STAGE, this.SLA_STAGE_IN_PROGRESS);
		taskSLADummyGr.setValue(this.ATTR_PLANNED_END_TIME, taskSLADummyGr.getValue(this.ATTR_ORIGINAL_BREACH_TIME));
		params.taskSLACopy.taskSLAgr = taskSLADummyGr;

		var dummyTaskGr = null;

		var hw = this.slaUtil.getHistoryWalker(
			params.walkedRecordGr.getRecordClassName(),
			params.walkedRecordGr.getValue('sys_id'),
			/*recordLevelSecurity*/ false,
			/*fieldLevelSecurity*/ false,
			/*withVariables*/ this.hwWithVariables,
			/*walkToFirstUpdate*/ true,
			/*withJournalFields*/ this.hwWithJournals,
			/*withSysFields*/ this.hwWithSysFields
		);

		if (!hw)
			return {};

		do {
			var walkedRecordGr = hw.getWalkedRecord();
			walkedRecordGr.original_sys_id = params.walkedRecordGr.getUniqueValue();
		} while (walkedRecordGr.sys_updated_on.getGlideObject().getDisplayValueInternal() < startTimeGdt.getDisplayValueInternal() && hw.walkForward());

		dummyTaskGr = hw.getWalkedRecordCopy();
		dummyTaskGr.setValue(this.ATTR_SYS_UPDATED_ON, startTimeGdt);
		params.retroactiveTaskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, undefined, dummyTaskGr));
		params.retroactiveTaskSLAStages[params.retroactiveTaskSLAStages.length - 1].mustHaveStage = true;
		params.prevTaskGr = this.slaUtil.copyGlideRecord(dummyTaskGr);
		params.prevTaskSLA = params.taskSLAController.copyTaskSLA(params.contractSLAGr, dummyTaskGr, taskSLADummyGr);
		//inspect for known pauses (only applicable for retroactive pause ticked SLAs.)
		for (var i = 0; i < retroactivePauseDataList.length; i++) {
			var taskSLAGrExitingOrEnteringPause = retroactivePauseDataList[i].taskSLAGr;
			var taskDummyGrCurrent = retroactivePauseDataList[i].responsibleTaskGr;
			if (i !== 0) {
				params.prevTaskGr = this.slaUtil.copyGlideRecord(retroactivePauseDataList[i - 1].responsibleTaskGr);
				params.prevTaskSLA = params.taskSLAController.copyTaskSLA(params.contractSLAGr, retroactivePauseDataList[i - 1].responsibleTaskGr, retroactivePauseDataList[i - 1].taskSLAGr);
			}
			taskDummyGrCurrent.setValue(this.ATTR_SYS_UPDATED_ON, taskSLAGrExitingOrEnteringPause.getValue(this.ATTR_SYS_UPDATED_ON));

			this._trackIfUpdateWasResponsibleForStageChange(params.retroactiveTaskSLAStages, params.stateChangeOccuredDueToUpdates, taskDummyGrCurrent);

			params.retroactiveTaskSLAStages.push(this._prepareTaskSLAStage(taskSLAGrExitingOrEnteringPause, params.retroactiveTaskSLAStages[params.retroactiveTaskSLAStages.length - 1], taskDummyGrCurrent));

			//insert landmarks as applicable at each stage
			this._insertLandMarkStages(params, true);
			if (i === retroactivePauseDataList.length - 1) {
				params.prevTaskGr = this.slaUtil.copyGlideRecord(retroactivePauseDataList[i].responsibleTaskGr);
				params.prevTaskSLA = params.taskSLAController.copyTaskSLA(params.contractSLAGr, retroactivePauseDataList[i].responsibleTaskGr, retroactivePauseDataList[i].taskSLAGr);
			}
			params.retroactiveTaskSLAStages[params.retroactiveTaskSLAStages.length - 1].mustHaveStage = true;
		}
		//join the retoractive stage and the stage at attached date
		attachedStageObj.start_date = params.retroactiveTaskSLAStages[params.retroactiveTaskSLAStages.length - 1].end_date;
		params.retroactiveTaskSLAStages.push(attachedStageObj);
		params.taskSLAStages = params.retroactiveTaskSLAStages;
		this._insertLandMarkStages(params, true);

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_insertRetroactiveStages] landMarkPercentageCount: " + params.landMarkPercentageCount + " taskSLAStages: " + JSON.stringify(params.taskSLAStages, null, 2));
	},

	_prepareFutureTaskSLA: function(contractSLAGr, preStartSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, countOfTaskSlas) {
		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_prepareFutureTaskSLA] countOfTaskSlas: " + countOfTaskSlas);

		if (preStartSLAStages && preStartSLAStages.length) {
			var futureTaskSLA = {};
			futureTaskSLA.read_allowed = true;
			futureTaskSLA.is_future = true;
			for (var i = 0; i < preStartSLAStages.length; i++) {
				if (!preStartSLAStages[i].values_at_evaluation_date.read_allowed) {
					futureTaskSLA.read_allowed = preStartSLAStages[i].values_at_evaluation_date.read_allowed;
					futureTaskSLA.security_check_fail_message = preStartSLAStages[i].values_at_evaluation_date.security_check_fail_message;
					break;
				}
			}

			if (futureTaskSLA.read_allowed) {
				futureTaskSLA.contract_sla_id = contractSLAGr.getUniqueValue();
				futureTaskSLA.text = gs.getMessage('Task SLA - {0}', '' + countOfTaskSlas);
				futureTaskSLA.attached_date = attachedDate;
				futureTaskSLA.pre_start_sla_stages = preStartSLAStages;
				futureTaskSLA.state_change_due_to_task_updates = stateChangeOccuredDueToUpdates;
			}
			taskSLAs.push(futureTaskSLA);
		}

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_prepareFutureTaskSLA] taskSLAs: " + JSON.stringify(taskSLAs, null, 2));
	},

	_prepareTaskSLA: function(contractSLAGr, taskSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, taskDummyGrCurrent, countOfTaskSlas, preStartStages, startedFromReset) {
		var taskSLAObj = {};
		taskSLAObj.read_allowed = true;
		var taskSLAReturnStages = [];
		if (taskSLAStages) {

			if (this.log.atLevel(GSLog.DEBUG))
				this.log.debug("[_prepareTaskSLA] taskSLAStages.length: " + taskSLAStages.length);

			for (var i = 0; i < taskSLAStages.length; i++) {
				if (!taskSLAStages[i].values_at_end_date.read_allowed) {
					taskSLAObj.read_allowed = taskSLAStages[i].values_at_end_date.read_allowed;
					taskSLAObj.security_check_fail_message = taskSLAStages[i].values_at_end_date.security_check_fail_message;
					break;
				}

				if (taskSLAStages[i].mustHaveStage || this.GET_ALL_STAGES) {
					var tempStage = {};
					tempStage = taskSLAStages[i];

					if (taskSLAReturnStages)
						tempStage.start_date = taskSLAReturnStages[taskSLAReturnStages.length - 1].end_date;

					this._addDateMapNonGrFields(tempStage, ['start_date', 'end_date']);
					var stageStartDateGdt = new GlideDateTime();
					stageStartDateGdt.setDisplayValueInternal(tempStage.start_date);
					var stageEndDateGdt = new GlideDateTime();
					stageEndDateGdt.setDisplayValueInternal(tempStage.end_date);
					var stageDurationMS = stageEndDateGdt.getNumericValue() - stageStartDateGdt.getNumericValue();
					tempStage.duration = new GlideDuration(stageDurationMS).getDisplayValue();
					taskSLAReturnStages.push(tempStage);
				}

			}

			if (taskSLAObj.read_allowed) {
				taskSLAObj.start_date = taskSLAStages[0].start_date;
				taskSLAObj.end_date = taskSLAStages[taskSLAStages.length - 1].end_date;
			}
		}

		if (taskSLAObj.read_allowed) {
			taskSLAObj.id = contractSLAGr.getUniqueValue() + '-' + attachedDate;
			taskSLAObj.contract_sla_id = contractSLAGr.getUniqueValue();
			taskSLAObj.text = gs.getMessage('Task SLA - {0}', '' + countOfTaskSlas);
			taskSLAObj.state_change_due_to_task_updates = stateChangeOccuredDueToUpdates;
			taskSLAObj.stages = taskSLAReturnStages;
			taskSLAObj.pre_start_stages = preStartStages;
			var taskSLAStartDate = new GlideDateTime();
			taskSLAStartDate.setDisplayValueInternal(taskSLAObj.start_date);
			var taskSLAEndDate = new GlideDateTime();
			taskSLAEndDate.setDisplayValueInternal(taskSLAObj.end_date);
			var slaSchedule = this.slaUtil.getSchedule(contractSLAGr, taskDummyGrCurrent);
			taskSLAObj.used_timezone = {};
			taskSLAObj.used_timezone.display_value = slaSchedule.getTimeZone();
			taskSLAObj.attached_date = attachedDate;
			taskSLAObj.business_schedule_spans = this._getBusinessScheduleSpans(taskSLAStartDate, taskSLAEndDate, slaSchedule);
			taskSLAObj.out_of_business_schedule_spans = [];

			if (taskSLAObj.start_date && taskSLAObj.end_date && slaSchedule.getID())
				taskSLAObj.out_of_business_schedule_spans = this._getOutOfBusinessScheduleSpans(taskSLAObj.start_date, taskSLAObj.end_date, taskSLAObj.business_schedule_spans, slaSchedule);

			this._addDateMapNonGrFields(taskSLAObj, ['start_date', 'end_date', 'attached_date']);
			taskSLAObj.started_from_reset = startedFromReset;
		}

		taskSLAs.push(taskSLAObj);

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_prepareTaskSLA] taskSLAs: " + JSON.stringify(taskSLAs, null, 2));
	},

	_prepareTaskSLAStage: function(taskSLADummyGr, prevStage, taskDummyGrCurrent) {
		var taskSLAStage = {};
		var taskSLADummyObj = this.slaUtil.grToJsObj(taskSLADummyGr, true);
		if (taskSLADummyObj.read_allowed) {
			//We forcibly copy these values if a schedule is not present. This is done so that the REST API always guarantees business fields
			if (!taskSLADummyObj[this.ATTR_SCHEDULE].value) {
				var duration0 = new GlideDuration(0).getValue() + '';
				if (!taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT] || (taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT] && (!taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT].value || duration0 === taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT].value) && taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT] = taskSLADummyObj[this.ATTR_TIME_LEFT];
				if (!taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE] || (taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE] && !taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE].value && taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE] = taskSLADummyObj[this.ATTR_PERCENTAGE];
				if (!taskSLADummyObj[this.ATTR_BUSINESS_DURATION] || (taskSLADummyObj[this.ATTR_BUSINESS_DURATION] && (!taskSLADummyObj[this.ATTR_BUSINESS_DURATION].value || duration0 === taskSLADummyObj[this.ATTR_BUSINESS_DURATION].value) && taskSLADummyObj[this.ATTR_BUSINESS_DURATION].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_DURATION] = taskSLADummyObj[this.ATTR_DURATION];
				if (!taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION] || (taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION] && (!taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION].value || duration0 === taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION].value) && taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION] = taskSLADummyObj[this.ATTR_PAUSE_DURATION];
			}
			//patch task values
			taskSLADummyObj[this.ATTR_TASK] = {
				value: taskDummyGrCurrent.original_sys_id, //This is stamped in history preparation method
				display_value: taskDummyGrCurrent.getDisplayValue()
			};
			/**
			 * Note: A SLA stage is evaluated at a particular point only. The elapsed time, percentages etc change with time but stage doesn't.
			 * So we nest the stage with a value_at_end_date to denote that this is the exact value at end_date and not through out this stage.
			 * The start_date is only a convenience attribute for drawing the timeline. The start_date is merely the last known stage.
			 **/
			var taskUpdateDate = taskDummyGrCurrent.sys_updated_on.getGlideObject().getDisplayValueInternal();
			var startDate = taskSLADummyObj.start_time.display_value_internal;
			if (startDate > taskUpdateDate) {
				taskSLAStage.future_start_date = startDate;
				taskSLAStage.evaluation_date = taskUpdateDate;
			} else {
				// If this is the first stage then start date is the SLA Rec's start time
				if (!prevStage)
					taskSLAStage.start_date = taskSLADummyObj.start_time.display_value_internal;
				else
					taskSLAStage.start_date = prevStage.end_date;

				taskSLAStage.end_date = taskUpdateDate;
			}
		}

		if (taskSLAStage.future_start_date)
			taskSLAStage.values_at_evaluation_date = taskSLADummyObj;
		else
			taskSLAStage.values_at_end_date = taskSLADummyObj;

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_prepareTaskSLAStage] taskSLAStage: " + JSON.stringify(taskSLAStage, null, 2));

		return taskSLAStage;
	},

	_insertLandMarkStages: function(params, retroactiveContext) {
		var taskSLAStages = retroactiveContext ? params.retroactiveTaskSLAStages : params.taskSLAStages;
		var tempTaskSLA = params.prevTaskSLA;

		if (params.landMarkPercentageCount === this.LAND_MARK_PERCENTAGES.length)
			return;

		if (taskSLAStages.length > 1) {

			if (this.log.atLevel(GSLog.DEBUG)) {
				this.log.logDebug('[_insertLandMarkStages] Previous percentage: ' + taskSLAStages[taskSLAStages.length - 2].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value);
				this.log.logDebug('[_insertLandMarkStages] Land mark evaluated: ' + this.LAND_MARK_PERCENTAGES[params.landMarkPercentageCount]);
				this.log.logDebug('[_insertLandMarkStages] Current percentage: ' + taskSLAStages[taskSLAStages.length - 1].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value);
			}

			//In a very remote case it is possible that the update has happened at landmark stage, so no calculation is required and we can move to next stage
			if (taskSLAStages[taskSLAStages.length - 1].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value === this.LAND_MARK_PERCENTAGES[params.landMarkPercentageCount]) {
				params.landMarkPercentageCount++;
				return;
			}
		} else
			return;

		//For inserting landmarks we need minimum two stages. Even if the landmark value is same as the real update we still continue evaluation as in a out of schedule time
		//it is possible that the percentage remains same but the breach could have happened earlier. This would be boundary condition when out of schedule start and landmark
		//is reached at same time
		while (taskSLAStages.length > 1 &&
			this.LAND_MARK_PERCENTAGES[params.landMarkPercentageCount] <= taskSLAStages[taskSLAStages.length - 1].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value &&
			taskSLAStages[taskSLAStages.length - 2].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value < this.LAND_MARK_PERCENTAGES[params.landMarkPercentageCount]) {

			if (this.log.atLevel(GSLog.DEBUG))
				this.log.logDebug('[_insertLandMarkStages] Landmark Percentage evaluation entered: ' + this.LAND_MARK_PERCENTAGES[params.landMarkPercentageCount]);

			var schedule = this.slaUtil.getSchedule(params.contractSLAGr, params.prevTaskGr);
			var hasSchedule = false;
			if (schedule && schedule.getID())
				hasSchedule = true;

			//Since this is a post-evaluation where we have gone beyond the percentage we are interested in we go back one step
			var prevStage = taskSLAStages[taskSLAStages.length - 2].values_at_end_date;

			var prevStageElapsedDuration;
			if (hasSchedule)
				prevStageElapsedDuration = prevStage[this.ATTR_BUSINESS_DURATION].value;
			else
				prevStageElapsedDuration = prevStage[this.ATTR_DURATION].value;

			var prevStageElapsedDurationMS = new GlideDateTime(prevStageElapsedDuration).getNumericValue();

			var totalDurMS = 0;
			if (prevStage[this.ATTR_ORIGINAL_BREACH_TIME].value) {
				// Original breach time is the time when the SLA started and it was the 100% mark
				var startTimeGdt = new GlideDateTime(prevStage[this.ATTR_START_TIME].value);
				var originalBreachTimeGdt = new GlideDateTime(prevStage[this.ATTR_ORIGINAL_BREACH_TIME].value);
				if (hasSchedule)
					totalDurMS = schedule.duration(startTimeGdt, originalBreachTimeGdt).getNumericValue();
				else
					totalDurMS = originalBreachTimeGdt.getNumericValue() - startTimeGdt.getNumericValue();
			} else // if original breach time is missing, we try to get the duration from the SLA Definition
				totalDurMS = contractSLAGr.duration.dateNumericValue();

			if (this.log.atLevel(GSLog.DEBUG))
				this.log.logDebug('[_insertLandMarkStages] totalDurMS: ' + totalDurMS);

			if (!totalDurMS)
				return;

			//Calculate in terms of milli-seconds the duration that is needed to be at the required percentage
			var landMarkDurMS = (totalDurMS) * this.LAND_MARK_PERCENTAGES[params.landMarkPercentageCount] / 100;
			var timeInMSToReachLandMark = landMarkDurMS - prevStageElapsedDurationMS;
			var duration = new GlideDuration(timeInMSToReachLandMark);

			if (this.log.atLevel(GSLog.DEBUG))
				this.log.logDebug('[_insertLandMarkStages] Has prevTaskGr: ' + !!params.prevTaskGr);

			if (!params.prevTaskGr)
				return;

			var prevTime = new GlideDateTime(params.prevTaskGr.getValue(this.ATTR_SYS_UPDATED_ON));

			var targetTime;
			if (hasSchedule) {
				targetTime = schedule.add(prevTime, duration);

				if (this.log.atLevel(GSLog.DEBUG))
					this.log.logDebug('[_insertLandMarkStages] Previous Time: ' + prevTime.getDisplayValueInternal() + ' Duration to add: ' + duration.getDisplayValue() + ' Target time: ' + targetTime.getDisplayValueInternal());
			} else {
				targetTime /*GlideDateTime*/ = new GlideDateTime(prevTime.getValue());
				targetTime.add(timeInMSToReachLandMark);

				if (this.log.atLevel(GSLog.DEBUG))
					this.log.logDebug('[_insertLandMarkStages] Previous Time: ' + prevTime.getDisplayValueInternal() + ' Target time: ' + targetTime.getDisplayValueInternal());
			}
			if (!targetTime)
				return;

			if (taskSLAStages[taskSLAStages.length - 1].end_date !== (targetTime.getDisplayValueInternal() + '')) {
				params.prevTaskGr[this.ATTR_SYS_UPDATED_ON] = targetTime;
				tempTaskSLA = params.taskSLAController.updateTaskSLA(params.prevTaskGr, tempTaskSLA, params.contractSLAGr);
				var tempTaskSLAGr = tempTaskSLA.getGlideRecord();
				// If we have a reset and no update in between, these pseudo updates will be treated like a true reset and set to previous stage value.
				if (tempTaskSLA.isReset || retroactiveContext)
					this._revertAttributes(tempTaskSLAGr, taskSLAStages[taskSLAStages.length - 2]);

				// insert the task_sla snapshot for the land mark percentage
				taskSLAStages.splice(taskSLAStages.length - 1, 0, this._prepareTaskSLAStage(tempTaskSLAGr, taskSLAStages[taskSLAStages.length - 2], params.prevTaskGr));
				taskSLAStages[taskSLAStages.length - 2].mustHaveStage = true;
				//readjust the highest snapshot's start date as we have more details available as a result of land mark insertions
				taskSLAStages[taskSLAStages.length - 1].start_date = taskSLAStages[taskSLAStages.length - 2].end_date;
			}
			params.landMarkPercentageCount++;
		}
		return;
	},

	_getContractSLARecs: function(taskSLAsAttached, contractSLAIds, taskGr) {
		var attached = [];
		var simulated = [];

		taskSLAsAttached.forEach(function(taskSla) {
			if (!contractSLAIds || (Array.isArray(contractSLAIds) && contractSLAIds.indexOf(taskSla.sla.value) !== -1))
				attached.push(taskSla.sla.value);
		});

		attached = this.arrayUtil.unique(attached);
		simulated = this.arrayUtil.unique(this.arrayUtil.diff(contractSLAIds, attached));
		var combined = this.arrayUtil.unique(this.arrayUtil.concat(attached, simulated));
		var contractSlaGr = Array.isArray(combined) && combined.length > 0 ? this._getContractSLARecsByIds(combined, taskGr) : null;

		var contractSlaRecs = {
			attached: attached,
			simulated: simulated,
			gr: contractSlaGr
		};

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_getContractSLARecs] contractSlaRecs: " + JSON.stringify(contractSlaRecs, null, 2));

		return contractSlaRecs;
	},

	_getContractSLARecsByIds: function(contractSlaIds, taskGr) {
		var contractSlaGr = new GlideRecord(this.TABLE_CONTRACT_SLA);
		if (taskGr && taskGr.isValidRecord())
			contractSlaGr.addDomainQuery(taskGr);
		contractSlaGr.addQuery(this.ATTR_SYS_ID, this.OPR_IN, contractSlaIds.join(','));
		contractSlaGr.query();

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[_getContractSLARecsByIds] encodedQuery: " + contractSlaGr.getEncodedQuery());

		return contractSlaGr;
	},

	_addChangedFields: function(walkedRecordGr, taskUpdate) {
		var fields = this.slaUtil.getChangedFields(walkedRecordGr);
		var field;
		var fieldName;
		for (var i = 0; i < fields.length; i++) {
			field = fields[i];
			fieldName = field.getName();

			if (fieldName + "" == this.ATTR_SYS_CREATED_ON || fieldName + "" == this.ATTR_SYS_UPDATED_ON)
				continue;

			taskUpdate[fieldName] = {
				label: field.getLabel()
			};

			if (field.canRead()) {
				var internalType = field.getED().getInternalType() + "";
				taskUpdate[fieldName].read_allowed = true;
				taskUpdate[fieldName].new_value = field.getValue();

				if (internalType === this.FIELD_TYPE_WF)
					taskUpdate[fieldName].new_value_user = this._getWorkflowFieldDisplayValue(fieldName, walkedRecordGr);
				else if (internalType === this.FIELD_TYPE_JOURNAL_INPUT)
					taskUpdate[fieldName].new_value_user = field.getJournalEntry(0);
				else
					taskUpdate[fieldName].new_value_user = field.getDisplayValue();
			} else {
				taskUpdate[fieldName].read_allowed = false;
				taskUpdate[fieldName].new_value = '';
				taskUpdate[fieldName].new_value_user = gs.getMessage('(restricted)');
			}
		}
	},

	/* this method is to avoid a known issue with calling "getDisplayValue" on a field that is of type "workflow"
	   as doing this overwrites the GlideRecord object that this field is attached to with the latest copy from the
	   database */
	_getWorkflowFieldDisplayValue: function(fieldName, walkedRecordGr) {
		var tempGr = new GlideRecord(walkedRecordGr.getRecordClassName());
		tempGr.initialize();
		tempGr.setValue(fieldName, walkedRecordGr.getValue(fieldName));

		return tempGr[fieldName].getDisplayValue();
	},

	_addChangedVariables: function(walkedRecordGr, taskUpdate) {
		var	variableNames = this.slaUtil.getChangedVariables(walkedRecordGr);
		var variableName;
		var variableElement;

		var canRead = walkedRecordGr.variables.canRead();

		for (var i = 0; i < variableNames.length; i++) {
			variableName = variableNames[i];
			if (canRead) {
				variableElement = walkedRecordGr.variables[variableName];
				taskUpdate[variableName] = {
					label: variableName,
					read_allowed: true,
					new_value: variableElement.getValue(),
					new_value_user: variableElement.getDisplayValue()
				};
			} else {
				taskUpdate[variableName] = {
					label: variableName,
					read_allowed: false,
					new_value: '',
					new_value_user: gs.getMessage('(restricted)')
				};
			}
		}
	},

	_addDateMapNonGrFields: function(obj, dateFieldsList) { /*These fields are expected to be in display_value_internal*/
		obj.dates_map_non_gr_dates = {};
		for (var i = 0; i < dateFieldsList.length; i++) {
			obj.dates_map_non_gr_dates[dateFieldsList[i]] = this.slaUtil.populateDateInCommonFormatsAndConversions(obj[dateFieldsList[i]], this.slaUtil.DATE_FORMAT_DISPLAY_VALUE_INTERNAL);
		}
	},

	_getBusinessScheduleSpans: function(startDate /*GlideDateTime*/ , endDate /*GlideDateTime*/ , schedule /*GlideSchedule*/ ) {
		var it = schedule.getTimeMap(startDate, endDate);
		var spans = [];
		var span;
		while (it.hasNext()) {
			var timeMap = it.next();
			span = {
				start_date: timeMap.getStart().getGlideDateTime().getDisplayValueInternal(),
				end_date: timeMap.getEnd().getGlideDateTime().getDisplayValueInternal()
			};
			this._addDateMapNonGrFields(span, ['start_date', 'end_date']);
			spans.push(span);
		}
		return spans;
	},

	_getOutOfBusinessScheduleSpans: function(startDate /*String - Display value internal*/ , endDate, /*String - Display value internal*/
		businessScheduleSpans /*o/p from _getBusinessScheduleSpans*/ , schedule /*GlideSchedule*/ ) {
		var pointerDate = startDate;
		var outOfBusinessScheduleSpans = [];
		var outOfBusinessScheduleSpan;
		var totalOutOfScheduleDurationMS = 0;
		var outOfScheduleStartDateGdt;
		var outOfScheduleEndDateGdt;
		var outOfScheduleDurationMS;
		var totalDurationAllIncludedMS;
		var startDateGdt = new GlideDateTime();
		startDateGdt.setDisplayValueInternal(startDate);
		var endDateGdt = new GlideDateTime();
		endDateGdt.setDisplayValueInternal(endDate);

		for (var i = 0; businessScheduleSpans && i < businessScheduleSpans.length && pointerDate < endDate; i++) {
			outOfScheduleStartDateGdt = new GlideDateTime();
			outOfScheduleStartDateGdt.setDisplayValueInternal(pointerDate);

			outOfScheduleEndDateGdt = new GlideDateTime();
			outOfScheduleEndDateGdt.setDisplayValueInternal(businessScheduleSpans[i].start_date);

			outOfScheduleDurationMS = outOfScheduleEndDateGdt.getNumericValue() - outOfScheduleStartDateGdt.getNumericValue();
			totalDurationAllIncludedMS = outOfScheduleEndDateGdt.getNumericValue() - startDateGdt.getNumericValue();
			totalOutOfScheduleDurationMS = totalOutOfScheduleDurationMS + outOfScheduleDurationMS;
			if (pointerDate + '' !== businessScheduleSpans[i].start_date + '') {
				outOfBusinessScheduleSpan = {
					start_date: pointerDate,
					end_date: businessScheduleSpans[i].start_date,
					duration_out_of_schedule: new GlideDuration(outOfScheduleDurationMS).getDisplayValue(),
					total_duration_out_of_schedule: new GlideDuration(totalOutOfScheduleDurationMS).getDisplayValue(),
					total_duration_all_included: new GlideDuration(totalDurationAllIncludedMS).getDisplayValue()
				};
				this._addDateMapNonGrFields(outOfBusinessScheduleSpan, ['start_date', 'end_date']);
				outOfBusinessScheduleSpans.push(outOfBusinessScheduleSpan);
			}

			pointerDate = businessScheduleSpans[i].end_date;
			//when the task sla ending time is not within schedule
			if (i === businessScheduleSpans.length - 1 && pointerDate < endDate) {
				outOfScheduleStartDateGdt = new GlideDateTime();
				outOfScheduleStartDateGdt.setDisplayValueInternal(pointerDate);

				totalDurationAllIncludedMS = endDateGdt.getNumericValue() - startDateGdt.getNumericValue();

				outOfScheduleDurationMS = endDateGdt.getNumericValue() - outOfScheduleStartDateGdt.getNumericValue();
				totalOutOfScheduleDurationMS = totalOutOfScheduleDurationMS + outOfScheduleDurationMS;

				outOfBusinessScheduleSpan = {
					start_date: pointerDate,
					end_date: endDate,
					duration_out_of_schedule: new GlideDuration(outOfScheduleDurationMS).getDisplayValue(),
					total_duration_out_of_schedule: new GlideDuration(totalOutOfScheduleDurationMS).getDisplayValue(),
					total_duration_all_included: new GlideDuration(totalDurationAllIncludedMS).getDisplayValue()
				};
				this._addDateMapNonGrFields(outOfBusinessScheduleSpan, ['start_date', 'end_date']);
				outOfBusinessScheduleSpans.push(outOfBusinessScheduleSpan);
			}
		}

		if (schedule.getID() && !businessScheduleSpans) {
			outOfScheduleDurationMS = endDateGdt.getNumericValue() - startDateGdt.getNumericValue();
			totalOutOfScheduleDurationMS = outOfScheduleDurationMS;
			totalDurationAllIncludedMS = outOfScheduleDurationMS;
			outOfBusinessScheduleSpan = {
				start_date: startDate,
				end_date: endDate,
				duration_out_of_schedule: new GlideDuration(outOfScheduleDurationMS).getDisplayValue(),
				total_duration_out_of_schedule: new GlideDuration(totalOutOfScheduleDurationMS).getDisplayValue(),
				total_duration_all_included: new GlideDuration(totalDurationAllIncludedMS).getDisplayValue()
			};
			this._addDateMapNonGrFields(outOfBusinessScheduleSpan, ['start_date', 'end_date']);
			outOfBusinessScheduleSpans.push(outOfBusinessScheduleSpan);
		}
		return outOfBusinessScheduleSpans;
	},

	getSlaDefinitionDetail: function(contractSlaIds) {
		var gr = new GlideRecord(this.TABLE_CONTRACT_SLA);
		gr.addQuery(this.ATTR_SYS_ID, this.OPR_IN, contractSlaIds);
		gr.query();
		var contractSlaDetails = [];
		while (gr.next()) {
			var contractSlaObj = {};
			contractSlaObj[this.ATTR_SYS_ID] = gr.getValue(this.ATTR_SYS_ID);
			if (gr.canRead() && gr.getElement(this.ATTR_NAME).canRead())
				contractSlaObj[this.ATTR_NAME] = gr.getValue(this.ATTR_NAME);
			else
				contractSlaObj[this.ATTR_NAME] = gs.getMessage('(restricted)');
			contractSlaObj[this.ATTR_URL] = gr.getLink(true);
			contractSlaObj[this.ATTR_COLLECTION] = gr.getValue(this.ATTR_COLLECTION);
			contractSlaDetails.push(contractSlaObj);
		}
		return contractSlaDetails;
	},

	type: 'SLATimeLineV2SNC'
};
