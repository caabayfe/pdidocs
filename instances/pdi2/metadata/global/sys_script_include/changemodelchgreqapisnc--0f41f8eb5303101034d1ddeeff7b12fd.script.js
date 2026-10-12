var ChangeModelChgReqAPISNC = Class.create();

ChangeModelChgReqAPISNC.prototype = {

	CLOSE_CODE: {
		SUCCESSFUL: "successful",
		UNSUCCESSFUL: "unsuccessful",
		SUCCESSFUL_ISSUES: "successful_issues"
	},

	LEGACY_CLOSE_STATE: (function(legacyStates) {
		var closed = legacyStates.CLOSED;
		var closedOther = legacyStates.CLOSED;
		if (Array.isArray(legacyStates.CLOSED)) {
			closed = legacyStates.CLOSED[0];
			closedOther = legacyStates.CLOSED[1];
		}
		return {
			SUCCESSFUL: closed,
			UNSUCCESSFUL: closedOther,
			SUCCESSFUL_ISSUES: closedOther
		};
	})(ChangeRequest.LEGACY_STATE || ChangeRequestSNC.LEGACY_STATE),

	LEGACY_STATE: ChangeRequest.LEGACY_STATE || ChangeRequestSNC.LEGACY_STATE,

	initialize: function (changeGr) {
		this._gr = changeGr;
		this._model = new ChangeModel(this._gr.chg_model.getRefRecord());

		this.typeCompatibility = gs.getProperty(ChangeRequestSNC.TYPE_COMPATIBILITY, "false") === "true";
		this.manageWorkflow = gs.getProperty(ChangeRequestSNC.MANAGE_WORKFLOW, "false") === "true";

		this.plugin = {
			"change_management": pm.isActive("com.snc.change_management"),
			"foundation": pm.isActive("com.snc.change_management.foundation"),
			"state_model": pm.isActive("com.snc.change_management.state_model"),
			"change_model": pm.isActive("com.snc.change_management.change_model")
		};
	},

	// New Model Methods
	getStateFieldName: function () {
		return this._model.getStateFieldName();
	},

	// Returns the initial state value of the model
	getInitialState: function () {
		var initialState = this._model.getFromCache("initial_state");
		if (initialState !== null)
			return initialState;

		var stateGr = this._model.getInitialState();
		if (!stateGr)
			return null;

		return stateGr.getValue("state_value");
	},

	// If the model is in an initial state.  If not using models this will default to 'isNew'
	isInitialState: function () {
		return this._model.inInitialState(this._gr);
	},
	
	//Returns true if the Change Request changes to the initial state
	changesToInitialState: function() {
		return this._changesTo(this.getInitialState());
	},
	
	//Returns true if the Change Request changes from the initial state
	changesFromInitialState: function() {
		return this._changesFrom(this.getInitialState());
	},
	
	// Reverts the Change Request to the initial state
	revertToInitialState: function () {
		return this._model.applyInitialState(this._gr);
	},

	// If the change is in a terminal state (no transitions).  If not using a model, is the sames as 'isClosed || isCancelled'.
	isTerminalState: function () {
		return this._model.inTerminalState(this._gr);
	},

	// Returns true if the state of the current record is the same as stateValue
	// stateValue can be an sttrm_state record or a value 
	isState: function (stateValue) {
		if (!stateValue)
			return false;

		if (this._isGlideRecord(stateValue)) {
			if (this.getTableName() !== "sttrm_state")
				return false;

			stateValue = stateValue.getValue("state_value");
		}

		return stateValue === this._gr.getValue(this._model.getStateFieldName());
	},

	// Returns true if the current record has the provided state as an available next state
	isNextState: function (stateValue) {
		stateValue = stateValue + "";
		var nextStates = this.getNextStates();
		return nextStates.indexOf(stateValue) !== -1;
	},
	
	// Returns true if the provided state value is a valid manual state transition
	isNextManualState: function(stateValue) {
		stateValue = stateValue + "";
		var nextStates = this.getNextManualStates();
		return nextStates.indexOf(stateValue) !== -1;
	},
	
	getNextStates: function() {
		var transitions = this._model.getFromCache("transitions") || {};
		
		var currentState = this._gr.getValue(this.getStateFieldName());
		if (transitions && transitions[currentState])
			return transitions[currentState];
		
		var stateValues = [];
		var transitionStateGr = this._model.getTransitionStates(this._gr);

		if (!transitionStateGr)
			return stateValues;

		while (transitionStateGr.next())
			stateValues.push(transitionStateGr.getValue("state_value"));

		transitions[currentState] = stateValues;
		this._model.addToCache("transitions", transitions);
		
		return stateValues;
	},
	
	getNextManualStates: function() {
		var manualTransitions = this._model.getFromCache("manual_transitions") || {};
		
		var currentState = this._gr.getValue(this.getStateFieldName());
		if (manualTransitions && manualTransitions[currentState])
			return manualTransitions[currentState];
		
		var stateValues = [];
		var transitionStateGr = this._model.getManualTransitionStates(this._gr);

		if (!transitionStateGr)
			return stateValues;

		while (transitionStateGr.next())
			stateValues.push(transitionStateGr.getValue("state_value"));
		
		manualTransitions[currentState] = stateValues;
		this._model.addToCache("manual_transitions", manualTransitions);
		
		return stateValues;
	},

	moveTo: function (stateValue) {
		if (!stateValue)
			return false;

		return this._model.applyState(this._gr, stateValue);
	},

	// Returns simple true/false values if the current record can transition to a new state
	canMoveTo: function (stateValue) {
		if (!stateValue)
			return false;

		return this.evaluateMoveTo(stateValue).transition_available;
	},
	
	// Returns the result of evaluating a move to the provided state
	evaluateMoveTo: function(stateValue, returnAll) {
		var noTransition = {
				"from_state": this._gr.getValue(this.getStateFieldName()),
				"to_state": stateValue,
				"transition_available": false
		};

		if (!stateValue)
			return returnAll ? [ noTransition ] : noTransition;

		stateValue = stateValue + "";
		var currentStateGr = this._model.getState(this._gr);
		if (!currentStateGr)
			return returnAll ? [ noTransition ] : noTransition;

		var transitionStateGr = new STTRMState(currentStateGr).getTransition(stateValue);
		if (!transitionStateGr)
			return returnAll ? [ noTransition ] : noTransition;

		var allTransition = [];
		var unavailableTransition = null;
		while (transitionStateGr.next()) {
			var transition = new STTRMTransition(transitionStateGr).evaluateConditions(this._gr);
			if (transition && transition.transition_available && !returnAll)
				return transition;

			if (unavailableTransition === null)
				unavailableTransition = transition;

			allTransition.push(transition);
		}

		if (returnAll)
			return allTransition.length > 0 ? allTransition : [ noTransition ];

		return unavailableTransition !== null ? unavailableTransition : noTransition;
	},

	// Returns true if the Change Request is in the defined 'implementation' state
	canImplement: function() {
		// Support both the 'implementation states' field and the 'allow_implementation' attribute
		return this._model.getImplementationStates().indexOf(this._gr.getValue(this.getStateFieldName())) !== -1;
	},

	// Returns a list of unique attributes a model contains
	getAttributesModelContains: function() {
		return this._model.getContainedAttributes();
	},

	// Returns true if any model states have the named attribute assigned
	modelContainsAttribute: function(attributeName) {
		return this._model.containsAttribute(attributeName);
	},

	// Returns true if the state of this change request has the provided attribute
	hasStateAttribute: function(attributeName) {

		return this.getStateAttributes().indexOf(attributeName) !== -1;
	},

	// Returns an array of all attributes the state of this change request has assigned
	getStateAttributes: function() {
		// If it's an unpersisted record and the state is blank, treat as new
		if (this._gr[this.getStateFieldName()].nil() && !this._gr.isValidRecord())
			return this._model.getStateAttributesValues(this.getInitialState());

		return this._model.getStateAttributesValues(this._gr.getValue(this.getStateFieldName()));
	},

	/**
	 * Return an array of the mandatory fields for a change, plus any mandatory fields
	 * required to transition to toState (if provided).
	 *
	 * Takes into account Template Field Policies.
	 */
	getMandatoryFields: function(toState) {
		var stateFieldName = this.getStateFieldName();
		var fromState = this._gr.getValue(stateFieldName);
		var mandatoryFields = [];

		if (toState) {
			var transitionMandatory = this._model.getTransitionMandatoryFields(fromState, toState);
			if (transitionMandatory)
				mandatoryFields = mandatoryFields.concat(transitionMandatory);
		}

		// Template Field Policies
		var templateSysId = this._gr.getValue("chg_model_template");
		if (templateSysId) {
			var templatePolicies = new ChangeTemplate(templateSysId).getFieldPolicies();
			if (templatePolicies && templatePolicies.mandatoryFieldPolicies)
				mandatoryFields = mandatoryFields.concat(templatePolicies.mandatoryFieldPolicies);
		}

		// Return unique field names.
		// Also if a user does not have write access to a field, it cannot be set mandatory
		return mandatoryFields.filter(function(elem, idx, arr) {
			return arr.indexOf(elem) === idx  && this._gr[elem].canWrite();
		}, this);
	},

	/**
	 * Return an array of the read only fields for a change.
	 *
	 * Takes into account:
	 * 		* Template Field Policies
	 * 		* Preset read only fields
	 */
	getReadOnlyFields: function(toState) {
		var readOnlyFields = [];

		// Template Field Policies
		var templateSysId = this._gr.getValue("chg_model_template");
		if (templateSysId) {
			var templatePolicies = new ChangeTemplate(templateSysId).getFieldPolicies();
			if (templatePolicies && templatePolicies.readOnlyFieldPolicies)
				readOnlyFields = readOnlyFields.concat(templatePolicies.readOnlyFieldPolicies);
		}

		// Preset Values
		if (this._model.applyRecordPreset())
			readOnlyFields = readOnlyFields.concat(this._model.getRecordPresetFields());

		// return unique field names which the user can write to.
		// if they don't have write access they cannot flip between read/write
		return readOnlyFields.filter(function(elem, idx, arr) {
			return arr.indexOf(elem) === idx && this._gr[elem].canWrite();
		}, this);
	},

	/**
	 * Returns true if you can modify the CI can be modified.
	 */
	canModifyCI: function(previousState) {
		var ALLOW_CI_MODIFICATION = "allow_ci_modification";

		var wasInitialState = false;
		if (previousState)
			wasInitialState = this.getInitialState() === previousState;

		// If there's no attribute default to initial state.  Perserves behaviour
		if (!this.modelContainsAttribute(ALLOW_CI_MODIFICATION))
			return this.isInitialState() || wasInitialState;
		
		// Check the previous state's attributes
		var prevStateHasAttribute = false;
		if (previousState)
			prevStateHasAttribute = this._model.hasStateAttribute(previousState, ALLOW_CI_MODIFICATION);

		// It's a model based change with the atribute in the model
		return this.hasStateAttribute(ALLOW_CI_MODIFICATION) || prevStateHasAttribute;
	},

	// Used to check multiple state values depending on the mapping of states to the is* etc. functions
	_isStateMultiple: function (stateValues) {
		if (Array.isArray(stateValues))
			return stateValues.some(function (stateValue) {
				return this.isState(stateValue);
			}, this);

		return this.isState(stateValues);
	},

	//Legacy state specific methods.
	// Legacy new state methods
	isNew: function () {
		return this._isStateMultiple(this.LEGACY_STATE.NEW);
	},
	changesToNew: function () {
		return this._changesTo(this.LEGACY_STATE.NEW);
	},
	changesFromNew: function () {
		return this._changesFrom(this.LEGACY_STATE.NEW);
	},
	setNew: function () {
		var stateVal = this.LEGACY_STATE.NEW;
		return this.moveTo(Array.isArray(stateVal) ? stateVal[0] : stateVal);
	},
	toNew: function () {
		return this.setNew() && !!this._gr.update();
	},

	// Legacy method.  Use revertToInitialState instead with an update.
	revertToNew: function () {
		if (this.plugin.state_model && this.typeCompatibility) {
			// Preserve the behaviour of types based change if installed
			var previous = {};
			previous.on_hold = this._gr.getValue("on_hold");
			this.setValue('on_hold', false);

			if (!this.revertToInitialState()) {
				this._gr.setValue("on_hold", previous.on_hold);
				return false;
			}

			if (this.manageWorkflow)
				new ChangeTypeChgReqAPI(this._gr).deleteDefaultWorkflowContext();
			return !!this._gr.update();
		}

		if (!this.revertToInitialState())
			return false;

		if (this.plugin.state_model && this.manageWorkflow)
			new ChangeTypeChgReqAPI(this._gr).deleteDefaultWorkflowContext();

		return !!this._gr.update();
	},

	// Legacy assess state methods.  Use isState with a specific state value instead.
	isAssess: function () {
		return this._isStateMultiple(this.LEGACY_STATE.ASSESS);
	},
	changesToAssess: function () {
		return this._changesTo(this.LEGACY_STATE.ASSESS);
	},
	setAssess: function () {
		return this.moveTo(this.LEGACY_STATE.ASSESS);
	},
	assess: function () {
		return this.setAssess() && !!this._gr.update();
	},

	// Legacy authorize state methods. Use isState with a specific state value instead.
	isAuthorize: function () {
		return this._isStateMultiple(this.LEGACY_STATE.AUTHORIZE);
	},
	changesToAuthorize: function () {
		return this._changesTo(this.LEGACY_STATE.AUTHORIZE);
	},
	setAuthorize: function () {
		return this.moveTo(this.LEGACY_STATE.AUTHORIZE);
	},
	authorize: function () {
		return this.setAuthorize() && !!this._gr.update();
	},

	//Legacy scheduled state methods. Use isState with a specific state value instead.
	isScheduled: function () {
		return this._isStateMultiple(this.LEGACY_STATE.SCHEDULED);
	},
	changesToScheduled: function () {
		return this._changesTo(this.LEGACY_STATE.SCHEDULED);
	},
	setScheduled: function () {
		return this.moveTo(this.LEGACY_STATE.SCHEDULED);
	},
	scheduled: function () {
		return this.setScheduled() && !!this._gr.update();
	},

	//Legacy implement state methods. Use isState with a specific state value instead.
	isImplement: function () {
		return this._isStateMultiple(this.LEGACY_STATE.IMPLEMENT);
	},
	changesToImplement: function () {
		return this._changesTo(this.LEGACY_STATE.IMPLEMENT);
	},
	setImplement: function () {
		return this.moveTo(this.LEGACY_STATE.IMPLEMENT);
	},
	implement: function () {
		return this.setImplement() && !!this._gr.update();
	},

	//Legacy review state methods. Use isState with a specific state value instead.
	isReview: function () {
		return this._isStateMultiple(this.LEGACY_STATE.REVIEW);
	},
	changesToReview: function () {
		return this._changesTo(this.LEGACY_STATE.REVIEW);
	},
	setReview: function () {
		return this.moveTo(this.LEGACY_STATE.REVIEW);
	},
	review: function () {
		this.setReview() && !!this._gr.update();
	},

	//Legacy close state methods. Use isState with a specific state value instead.
	isClosed: function () {
		return this._isStateMultiple(this.LEGACY_STATE.CLOSED);
	},
	changesToClosed: function () {
		return this._changesTo(this.LEGACY_STATE.CLOSED);
	},

	// For isClosed*, No close_code field without change_management.  All state driven.
	isClosedSuccessful: function () {
		if (!this.plugin.change_management)
			return this.isState(this.LEGACY_CLOSE_STATE.SUCCESSFUL);

		return this.isClosed() && this._gr.getValue("close_code") === this.CLOSE_CODE.SUCCESSFUL;
	},

	isClosedSuccessfulWithIssues: function () {
		if (!this.plugin.change_management)
			return this.isState(this.LEGACY_CLOSE_STATE.SUCCESSFUL_ISSUES);

		return this.isClosed() && this._gr.getValue("close_code") === this.CLOSE_CODE.SUCCESSFUL_ISSUES;
	},

	isClosedUnsuccessful: function () {
		if (!this.plugin.change_management)
			return this.isState(this.LEGACY_CLOSE_STATE.UNSUCCESSFUL);

		return this.isClosed() && this._gr.getValue("close_code") === this.CLOSE_CODE.UNSUCCESSFUL;
	},

	setClose: function (closeCode, closeNotes) {
		var closeState = this.LEGACY_CLOSE_STATE.SUCCESSFUL;
		var closeCodes = [
			this.CLOSE_CODE.SUCCESSFUL,
			this.CLOSE_CODE.SUCCESSFUL_ISSUES,
			this.CLOSE_CODE.UNSUCCESSFUL
		];
		var legacyStates = [
			this.LEGACY_CLOSE_STATE.SUCCESSFUL,
			this.LEGACY_CLOSE_STATE.SUCCESSFUL_ISSUES,
			this.LEGACY_CLOSE_STATE.UNSUCCESSFUL
		];

		var codeIdx = closeCodes.indexOf(closeCode);
		if (codeIdx === -1)
			codeIdx = 0;

		if (!this.plugin.foundation && !this.plugin.state_model)
			closeState = legacyStates[codeIdx];

		var previous = {};
		previous.close_notes = this._gr.getValue("close_notes");
		if (closeNotes)
			this._gr.setValue("close_notes", closeNotes);

		if (this.plugin.change_management) {
			previous.close_code = this._gr.getValue("close_code");
			if (closeCode)
				this._gr.setValue("close_code", closeCode);
		}

		// If we can apply the state, everything is OK
		if (this._model.applyState(this._gr, closeState))
			return true;

		//Reset field values if we couldn't apply the state
		this._gr.setValue("clode_notes", previous.close_notes);
		if (this.plugin.change_management)
			this._gr.setValue("close_code", previous.close_code);
		return false;
	},

	close: function (closeCode, closeNotes) {
		return this.setClose(closeCode, closeNotes) && !!this._gr.update();
	},

	closeSuccessful: function (closeNotes) {
		return this.close(this.CLOSE_CODE.SUCCESSFUL, closeNotes ? closeNotes : gs.getMessage("Change closed successfully"));
	},

	closeSuccessfulWithIssues: function (closeNotes) {
		return this.close(this.CLOSE_CODE.SUCCESSFUL_ISSUES, closeNotes ? closeNotes : gs.getMessage("Change closed successfully with issues"));
	},

	closeUnsuccessful: function (closeNotes) {
		return this.close(this.CLOSE_CODE.UNSUCCESSFUL, closeNotes ? closeNotes : gs.getMessage("Change closed unsuccessfully"));
	},

	/**
	 * Cancel
	 */
	isCanceled: function () {
		return this._isStateMultiple(this.LEGACY_STATE.CANCELED);
	},
	changesToCanceled: function () {
		return this._changesTo(this.LEGACY_STATE.CANCELED);
	},
	setCancel: function () {
		var stateVal = this.LEGACY_STATE.CANCELED;
		return this.moveTo(Array.isArray(stateVal) ? stateVal[0] : stateVal);
	},
	cancel: function () {
		return this.setCancel() && !!this._gr.update();
	},
	
	// Legacy requestApproval state transition methods
	// This method assumes the Assess and Authorize states are used to create approvals,
	// states which may not exist in the model 
	setRequestApproval: function() {
		return (this.LEGACY_STATE.ASSESS && this.moveTo(this.LEGACY_STATE.ASSESS)) ||
				(this.LEGACY_STATE.AUTHORIZE && this.moveTo(this.LEGACY_STATE.AUTHORIZE));
	},
	
	requestApproval: function() {
		if (this.setRequestApproval())
			return !!this._gr.update();
		
		return false;
	},
	
	_changesTo: function (stateValue) {
		if (!stateValue)
			return false;

		var stateFieldName = this._model.getStateFieldName();
		if (Array.isArray(stateValue))
			return stateValue.some(function (stateValue) {
				return this._gr[stateFieldName].changesTo(stateValue);
			}, this);

		return this._gr[stateFieldName].changesTo(stateValue);
	},

	_changesFrom: function (stateValue) {
		if (!stateValue)
			return false;

		var stateFieldName = this._model.getStateFieldName();
		if (Array.isArray(stateValue))
			return stateValue.some(function (stateValue) {
				return this._gr[stateFieldName].changesFrom(stateValue);
			}, this);

		return this._gr[stateFieldName].changesFrom(stateValue);
	},

	_isGlideRecord: function (inputVar) {
		return inputVar && typeof inputVar.getTableName === "function";
	},

	type: 'ChangeModelChgReqAPISNC'
};

ChangeModelChgReqAPISNC.DEFAULT_ITIL_MODELS = {
		"standard": "e55d0bfec343101035ae3f52c1d3ae49",
		"normal": "007c4001c343101035ae3f52c1d3aeb2",
		"emergency": "62d10fa1c303101035ae3f52c1d3aec1"
};

ChangeModelChgReqAPISNC.getModelOrDefault = function (processName) {
	if (!processName)
		return null;

	// Cater for overloads.
	var defaultITILModels = ChangeModelChgReqAPI.DEFAULT_ITIL_MODELS || ChangeModelChgReqAPISNC.DEFAULT_ITIL_MODELS;
	if (Object.keys(defaultITILModels).indexOf(processName) === -1)
		return null;

	var defaultModel = defaultITILModels[processName];

	var modelRecord = new GlideRecord("chg_model");
	modelRecord.addActiveQuery();
	modelRecord.addQuery("table_name", "change_request");
	modelRecord.addQuery("itil_change_process", processName);
	modelRecord.orderBy("sys_id");
	modelRecord.query();

	if (modelRecord.next())
		return modelRecord.getUniqueValue();

	return defaultModel;
};

ChangeModelChgReqAPISNC.newNormal = function () {
	// Does not use ChangeRequest.NORMAL as that value changes dependent on configuration
	var modelName = "normal";
	return ChangeModelChgReqAPI.newChange(ChangeModelChgReqAPISNC.getModelOrDefault(modelName));
};

ChangeModelChgReqAPISNC.newStandard = function () {
	// Does not use ChangeRequest.STANDARD as that value changes dependent on configuration
	var modelName = "standard";
	return ChangeModelChgReqAPI.newChange(ChangeModelChgReqAPISNC.getModelOrDefault(modelName));
};

ChangeModelChgReqAPISNC.newEmergency = function () {
	// Does not use ChangeRequest.EMERGENCY as that value changes dependent on configuration
	var modelName = "emergency";
	return ChangeModelChgReqAPI.newChange(ChangeModelChgReqAPISNC.getModelOrDefault(modelName));
};

ChangeModelChgReqAPISNC.newChange = function (modelSysIdOrType) {

	// Allow type names for backwards compatibility.
	// These are keyed to the values being used based on the config of instance.
	var namedTypes = {};
	namedTypes[ChangeRequest.NORMAL] = ChangeModelChgReqAPI.newNormal;
	namedTypes[ChangeRequest.STANDARD] = ChangeModelChgReqAPI.newStandard;
	namedTypes[ChangeRequest.EMERGENCY] = ChangeModelChgReqAPI.newEmergency;

	if (modelSysIdOrType && namedTypes[modelSysIdOrType])
		return namedTypes[modelSysIdOrType]();

	var changeGr = new GlideRecord("change_request");
	changeGr.newRecord();

	//If a model sysId isn't provided try the default from the change request record
	var changeModelGr = null;
	if (JSUtil.nil(modelSysIdOrType)) {
		if (changeGr.chg_model.nil())
			return null;

		changeModelGr = changeGr.chg_model.getRefRecord();
	} else {
		changeModelGr = new GlideRecord("chg_model");
		if (!changeModelGr.get(modelSysIdOrType))
			return null;
	}

	var changeModel = new ChangeModel(changeModelGr);
	changeModel.applyModel(changeGr);
	return new ChangeRequest(changeGr);
};
