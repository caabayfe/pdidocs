var ChangeTypeChgReqAPISNC = Class.create();

ChangeTypeChgReqAPISNC.ENFORCE_DATA_REQ_PROP = "com.snc.change_management.enforce_data_requirements";

ChangeTypeChgReqAPISNC.prototype = {
	SUCCESSFUL: "successful",
	UNSUCCESSFUL: "unsuccessful",
	SUCCESSFUL_ISSUES: "successful_issues",
	REQUESTED: "requested",
	APPROVED: "approved",
	REJECTED: "rejected",
	NOT_REQUESTED: "not requested",
	EMERGENCY_WORKFLOW: ChangeRequest.prototype.EMERGENCY_WORKFLOW || "Change Request - Emergency",
	STANDARD_WORKFLOW: ChangeRequest.prototype.STANDARD_WORKFLOW || "Change Request - Standard",
	NORMAL_WORKFLOW: ChangeRequest.prototype.NORMAL_WORKFLOW || "Change Request - Normal",

	initialize: function(changeGr) {
		this._log = new GSLog(ChangeCommon.LOG_PROPERTY, this.type);
		this._gr = changeGr;
		this._stateHandler = new ChangeRequestStateHandler(this._gr);
	},

	isInitialState: function() {
		// This checks if it's in the new state or if it's a new record
		return this.isNew();
	},
	
	revertToInitialState: function() {
		this.setNew();
		return this.changesToNew();
	},
	
	// If the change is in a terminal state (no transitions).
	// If not using a model, is the sames as 'isClosed || isCancelled'.
	isTerminalState: function() {
		return this.isClosed() || this.isCanceled();
	},
	
	// Returns true if the state of the current record is the same as stateValue
	isState: function(stateValue) {
		if (!stateValue)
			return false;
		
		return stateValue === this._gr.getValue("state");
	},
	
	//  No equivalent in base implementation
	isNextState: function(stateValue) {
		return this.canMoveTo(stateValue) && this.getNextStates().indexOf(stateValue) !== -1;
	},

	isNextManualState: function(stateValue) {
		return this.canMoveTo(stateValue) && this.getNextManualStates().indexOf(stateValue) !== -1;
	},

	getNextStates: function() {
		var stateValues = [];
		var nextStates = this._stateHandler.getAvailableStates();
		if (nextStates) {
			nextStates.forEach(function(nextState) {
				stateValues.push(this._stateHandler.getStateValue(nextState));
			}, this);
		}
		return stateValues;
	},

	getNextManualStates: function() {
		var stateValues = [];
		var nextStates = this._stateHandler.getNextStates();
		if (nextStates) {
			nextStates.forEach(function(nextState) {
				stateValues.push(this._stateHandler.getStateValue(nextState));
			}, this);
		}
		return stateValues;
	},

	moveTo: function(stateValue) {
		if (!stateValue)
			return false;

		stateValue = this._stateHandler.getStateName(stateValue) || stateValue;
		return this._stateHandler.moveTo(stateValue);
	},
	
	canMoveTo: function (stateValue) {
		if (!stateValue)
			return false;
		
		stateValue = this._stateHandler.getStateName(stateValue) || stateValue;
		return this._stateHandler.canMoveTo(stateValue);
	},
	
	//  No equivalent in base implementation
	evaluateMoveTo: function (stateValue, returnAll) {
		var transitions = {
			"from_state": this._gr.getValue("state"),
			"to_state": stateValue,
			"transition_available": this.canMoveTo(stateValue)
		};
		return returnAll ? [transitions] : transitions;
	},
	
	// Allow implementation in Implement and Review states
	canImplement: function() {
		return this.isImplement() || this.isReview();
	},
	
	/**
	 * Providing a set of attributes methods checking a restricted set of attributes
	 * to preserve behaviour.
	 * 
	 * This mirrors the behaviour of the model attributes but only uses:
	 * 	* allow_ci_modification
	 * 	* allow_implementation
	 * 
	 * These attributes are bound to specific states in type based change and these methods
	 * reflect those bindings.
	 * 
	 * E.g. calling 'canImplement' and 'hasStateAttribute("allow_implementation")' will
	 * return the same value for the appropriate states.
	 */
	getAttributesModelContains: function() {
		return ["allow_ci_modification","allow_implementation"];
	},

	modelContainsAttribute: function(attributeName) {
		return this.getAttributesModelContains().indexOf(attributeName) !== -1;
	},

	hasStateAttribute: function(attributeName) {
		return this.getStateAttributes().indexOf(attributeName) !== -1;
	},

	// Attribites bound to specific states
	getStateAttributes: function() {
		if (this.isInitialState() || !this._gr.isValidRecord() && this._gr.state.nil())
			return ["allow_ci_modification"];
		
		if (this.canImplement())
			return ["allow_implementation"];
		
		return [];
	},



	/**
	 * New
	 */
	isNew: function() {
		// Change state model's label is New but that's a Javascript reserved word so draft is used instead
		return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.DRAFT);
	},

	changesToNew: function() {
		return this._gr.state.changes() && this.isNew();
	},

	changesFromNew: function() {
		return this._gr.state.changesFrom(this._stateHandler.getStateValue(ChangeRequestStateHandler.DRAFT));
	},

	setNew: function() {
		this._stateHandler.moveTo(ChangeRequestStateHandler.DRAFT);
	},

	// use toNew to avoid using the reserved word 'new'
	toNew: function() {
		this.setNew();
		return this._insertUpdate();
	},

	/**
	* Revert the Change Request to New by invoking the state model handler
	* Delete the workflow context associated to the current change type
	*
	* Return false if the state model does not allow the modification
	* Return true (and clear the On Hold field) if the Change Request has been successfully reverted to New
	*/
	revertToNew: function() {
		this.setNew();
		if (!this.changesToNew())
			return false;
		this.deleteDefaultWorkflowContext();
		this.setValue('on_hold', false);
		this.update();
		return true;
	},

	/**
	 * Assess -- used internally by the change request workflows.
	 * 
	 * To move a change (regardless of type) to the state after New call requestApproval instead
	 */
	isAssess: function() {
		return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.ASSESS);
	},

	changesToAssess: function() {
		return this._gr.state.changes() && this.isAssess();
	},

	setAssess: function() {
		this._stateHandler.moveTo(ChangeRequestStateHandler.ASSESS);
	},

	assess: function() {
		this.setAssess();
		return this._insertUpdate(); 
	},

	/**
	 * Authorize -- used internally by the change request workflows.
	 * 
	 * To move a change (regardless of type) to the state after New call requestApproval instead
	 */
	isAuthorize: function() {
		return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.AUTHORIZE);
	},

	changesToAuthorize: function() {
		return this._gr.state.changes() && this.isAssess();
	},

	setAuthorize: function() {
		this._stateHandler.moveTo(ChangeRequestStateHandler.AUTHORIZE);
	},

	authorize: function() {
		this.setAuthorize();
		return this._insertUpdate();
	},

	/**
	 * Scheduled -- used internally by the change request workflows.
	 * 
	 * To move a change (regardless of type) to the state after New call requestApproval instead
	 */
	isScheduled: function() {
		return this._gr.getValue("state") === this._stateHandler.getStateValue(ChangeRequestStateHandler.SCHEDULED);
	},

	changesToScheduled: function() {
		return this._gr.state.changes() && this.isScheduled();
	},

	setScheduled: function() {
		this._stateHandler.moveTo(ChangeRequestStateHandler.SCHEDULED);
	},

	scheduled: function() {
		this.setScheduled();
		return this._insertUpdate();
	},

	/**
	 * Implement
	 */
	isImplement: function() {
		return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.IMPLEMENT);
	},

	changesToImplement: function() {
		return this._gr.state.changes() && this.isImplement();
	},

	setImplement: function() {
		this._stateHandler.moveTo(ChangeRequestStateHandler.IMPLEMENT);
	},

	implement: function() {
		this.setImplement();
		return this._insertUpdate();
	},

	/**
	 * Review
	 */
	isReview: function() {
		return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.REVIEW);
	},

	changesToReview: function() {
		return this._gr.state.changes() && this.isReview();
	},

	setReview: function() {
		this._stateHandler.moveTo(ChangeRequestStateHandler.REVIEW);
	},

	review: function() {
		this.setReview();
		return this._insertUpdate();
	},

	/**
	 * Close
	 */
	isClosed: function() {
		return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.CLOSED);
	},

	changesToClosed: function() {
		return this._gr.state.changes() && this.isClosed();
	},

	isClosedSuccessful: function() {
		return this.isClosed() && this._gr.close_code + "" === this.SUCCESSFUL;
	},

	isClosedSuccessfulWithIssues: function() {
		return this.isClosed() && this._gr.close_code + "" === this.SUCCESSFUL_ISSUES;
	},

	isClosedUnsuccessful: function() {
		return this.isClosed() && this._gr.close_code + "" === this.UNSUCCESSFUL;
	},

	setClose: function(closeCode, closeNotes) {
		this._stateHandler.moveTo(ChangeRequestStateHandler.CLOSED);

		if (closeNotes)
			this._gr.close_notes = closeNotes;

		switch (closeCode) {
			case this.UNSUCCESSFUL:
				this._gr.close_code = this.UNSUCCESSFUL;
				break;
			case this.SUCCESSFUL_ISSUES:
				this._gr.close_code = this.SUCCESSFUL_ISSUES;
				break;
			default:
				this._gr.close_code = this.SUCCESSFUL;
		}
	},

	close: function(closeCode, closeNotes) {
		this.setClose(closeCode, closeNotes);
		return this._insertUpdate();
	},

	closeSuccessful: function(closeNotes) {
		if (!closeNotes)
			closeNotes = gs.getMessage("Change closed successfully");

		return this.close(this.SUCCESSFUL, closeNotes);
	},

	closeSuccessfulWithIssues: function(closeNotes) {
		if (!closeNotes)
			closeNotes = gs.getMessage("Change closed successfully with issues");

		return this.close(this.SUCCESSFUL_ISSUES, closeNotes);
	},

	closeUnsuccessful: function(closeNotes) {
		if (!closeNotes)
			closeNotes = gs.getMessage("Change closed unsuccessfully");

		return this.close(this.UNSUCCESSFUL, closeNotes);
	},

	/**
	 * Cancel
	 */
	isCanceled: function() {
		return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.CANCELED);
	},

	changesToCanceled: function() {
		return this._gr.state.changes() && this.isCanceled();
	},

	setCancel: function() {
		this._stateHandler.moveTo(ChangeRequestStateHandler.CANCELED);
	},

	cancel: function() {
		this.setCancel();
		return this._insertUpdate();
	},

	/**
	 * Approvals
	 */
	isApprovalRequested: function() {
		var state = this._gr.state + "";
		var assess = this._stateHandler.getStateValue(ChangeRequestStateHandler.ASSESS);
		var authorize = this._stateHandler.getStateValue(ChangeRequestStateHandler.AUTHORIZE);

		return (state === assess || state === authorize) && this._gr.approval + "" === this.REQUESTED;
	},

	isApproved: function() {
		var state = this._gr.state + "";
		var assess = this._stateHandler.getStateValue(ChangeRequestStateHandler.ASSESS);
		var authorize = this._stateHandler.getStateValue(ChangeRequestStateHandler.AUTHORIZE);

		return !this.isNew() && state !== assess && state !== authorize && this._gr.approval + "" === this.APPROVED;
	},

	isRejected: function() {
		return this.isNew() && this._gr.approval + "" === this.REJECTED;
	},

	setRequestApproval: function() {
		if (this.isNew())
			return this._stateHandler.next();
		
		return false;
	},

	requestApproval: function() {
		if (this.setRequestApproval())
			return this._insertUpdate();
		
		return false;
	},

	_insertUpdate: function() {
		return (this._gr.isNewRecord() ? this.insert() : this.update());
	},

	setValue: function(name, value) {
		this._gr.setValue(name, value);
	},
	
	getValue: function(name) {
		return this._gr.getValue(name);
	},

	setDisplayValue: function(name, value) {
		this._gr.setDisplayValue(name, value);
	},

	getDisplayValue: function(name) {
		return this._gr.getDisplayValue(name);
	},

	insert: function() {
		var id = this._gr.insert();

		var gr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
		if (!gr.get(id))
			this._gr = null;

		this.initialize(gr);
	},

	update: function() {
		this._gr.update();
	},
	
	refreshGlideRecord: function() {
		var gr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
		if (!gr.get(this._gr.getUniqueValue()))
			this._gr = null;


		this.initialize(gr);
	},

	modifyType: function(previousType) {	
		if (JSUtil.nil(this._gr) || JSUtil.nil(previousType))
			return;
		
		// Modifying Change Type from 'anything' to 'Standard' is not allowed
		if (this.getValue("type") == ChangeRequest.STANDARD)
			return;
		
		//Deleting the workflow context related to the previous Change Type
		var workflowName = this._getWorkflowFromType(previousType);
		this._deleteWorkflowContext(workflowName);
		
		if (previousType == ChangeRequest.STANDARD)
			this._gr.approval = this.NOT_REQUESTED;
	},

	deleteDefaultWorkflowContext: function() {
		// delete default workflow context based on current type
		var workflowName = this._getWorkflowFromType(this.getValue('type'));
		this._deleteWorkflowContext(workflowName);
	},

	_updateStdStats: function(){
		var util = new StdChangeUtils();
		var stdChgProducerVersion = this.getValue(util.ATTR_STD_CHG_PRODUCER_VERSION);
		if (!JSUtil.nil(stdChgProducerVersion)){
			this.setValue(util.ATTR_STD_CHG_PRODUCER_VERSION, '');
			util.updateVersionStats(stdChgProducerVersion.getUniqueValue());
		}
	},

	_deleteWorkflowContext: function(workflowName){
		var workflow = new Workflow();
		var wfContext = workflow.getContexts(this._gr);
		while (wfContext.next()) {
			if (wfContext.workflow_version.nil() || wfContext.state + "" !== "executing")
				continue;
			
			var wfVersion = wfContext.workflow_version.getRefRecord();
			if (wfVersion.name + "" === workflowName) {
				wfContext.deleteRecord();
				break;
			}
		}
	},

	_getWorkflowFromType: function(type){
		var workflow = ""; 
		switch (type){
			case ChangeRequest.EMERGENCY:
				workflow = this.EMERGENCY_WORKFLOW;
				break;
			case ChangeRequest.NORMAL:
				workflow = this.NORMAL_WORKFLOW;
				break;
			case ChangeRequest.STANDARD:
				workflow = this.STANDARD_WORKFLOW;
				break;
		}
		return workflow;
	},

	toString: function() {
		return JSON.stringify(this.toJS());
	},

	toJS: function() {
		return ChangeCommon.toJS(this._gr);
	},

	deleteRecord: ChangeCommon.methods.deleteRecord,

	getGlideRecord: ChangeCommon.methods.getGlideRecord,

	setValues: ChangeCommon.methods.setValues,

	canWriteTo: ChangeCommon.methods.canWriteTo,

	type: 'ChangeTypeChgReqAPISNC'
};

ChangeTypeChgReqAPISNC.newNormal = function() {
	return ChangeTypeChgReqAPI.newChange(ChangeRequest.NORMAL);
};

ChangeTypeChgReqAPISNC.newStandard = function() {
	return ChangeTypeChgReqAPI.newChange(ChangeRequest.STANDARD);
};

ChangeTypeChgReqAPISNC.newEmergency = function() {
	return ChangeTypeChgReqAPI.newChange(ChangeRequest.EMERGENCY);
};

ChangeTypeChgReqAPISNC.newChange = function(type) {
	var changeGr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
	changeGr.newRecord();
	
	changeGr.setValue("state", new ChangeRequestStateHandler().getStateValue(ChangeRequestStateHandler.DRAFT));

	if (JSUtil.notNil(type))
		changeGr.setValue("type", type);

	return new ChangeRequest(changeGr);
};
