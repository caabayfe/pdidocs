var ChangeRequestChgReqAPISNC = Class.create();

ChangeRequestChgReqAPISNC.ENFORCE_DATA_REQ_PROP = "com.snc.change_management.enforce_data_requirements";

ChangeRequestChgReqAPISNC.prototype = {
    REQUESTED: "requested",
    APPROVED: "approved",
    REJECTED: "rejected",

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
	
    initialize: function(changeGr) {
		this._log = new GSLog(ChangeCommon.LOG_PROPERTY, this.type);
        this._gr = changeGr;
		
		this.plugin = {
			"change_management": pm.isActive("com.snc.change_management"),
			"foundation": pm.isActive("com.snc.change_management.foundation")
		};
    },

	// New non state specific Methods
	isInitialState: function() {
		return this.isNew();
	},
	
	// Should be used instead of 'revertToNew'
	// This method will revert the state field but not persist the record
	revertToInitialState: function() {
		return this.setNew();
	},
	
	// Returns true if the change is in a state with no transitions
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
		return true;
	},
	
	// Return all states from change_request.state
	getNextStates: function() {
		var stateValues = [];
		var choiceGr = new GlideSysChoice("change_request", "state").getChoices();
		
		while (choiceGr.next()) {
			if (choiceGr.getValue("inactive") === "1")
				continue;
			stateValues.push(choiceGr.getValue("value"));
		}
		return stateValues;
	},
	
	moveTo: function(stateValue) {
		if (!stateValue)
			return false;

		this._gr.setValue("state", stateValue);
		return true;
	},
	
	//  No equivalent in base implementation
	canMoveTo: function (stateValue) {
		return true;
	},
	
	//  No equivalent in base implementation
	evaluateMoveTo: function (stateValue, returnAll) {
		var transitions = {
			"from_state": this._gr.getValue("state"),
			"to_state": stateValue,
			"transition_available": true
		};
		return returnAll ? [transitions] : transitions;
	},
	
	// For base Change Request you can implement in any state
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

	
	//Utility methods
	_changesTo: function(stateValue) {
		if (!stateValue)
			return false;

		if (Array.isArray(stateValue))
			return stateValue.some(function(stateValue){
				return this._gr.state.changesTo(stateValue);
			}, this);

		return this._gr.state.changesTo(stateValue);
	},
	
	_changesFrom: function(stateValue) {
		if (!stateValue)
			return false;
		
		if (Array.isArray(stateValue))
			return stateValue.some(function(stateValue){
				return this._gr.state.changesFrom(stateValue);
			}, this);

		return this._gr.state.changesFrom(stateValue);
	},
	
	_isStateMultiple: function(stateValues) {
		if (Array.isArray(stateValues))
			return stateValues.some(function(stateValue){
				return this.isState(stateValue);
			},this);
		
		return this.isState(stateValues);
	},
	
	/**
	 * New
	 */
    isNew: function() {
        return this._isStateMultiple(this.LEGACY_STATE.NEW);
    },

    changesToNew: function() {
        return this._changesTo(this.LEGACY_STATE.NEW);
    },

    changesFromNew: function() {
		//Changes from Pending or Open
		return this._changesFrom(this.LEGACY_STATE.NEW);
    },

    setNew: function() {
        return this.moveTo("-5"); // First 'new' state in both models.
    },

    // use toNew to avoid using the reserved word 'new'
    toNew: function() {
		return this.setNew() && !!this._gr.update();
    },
	
	/**
	 * Assess
	 * No equivalent so mapped to approvals.
	 */
	
	//Used to determine the assess or authorize states if the foundation plugin is not active
	isApprovalRequested: function() {
		return this._gr.getValue("approval") === this.REQUESTED;
	},
	
	isAssess: function() {
		if (!this.plugin.foundation)
			return this.isApprovalRequested();
		
		return this.isState(this.LEGACY_STATE.ASSESS);
	},

    changesToAssess: function() {
		return this._gr.approval.changes() && this.isAssess();
    },

    setAssess: function() {
		if (this.plugin.foundation)
			return this.moveTo(this.LEGACY_STATE.ASSESS);
		
		return true;
    },

    assess: function() {
        return this.setAssess() && !!this._gr.update();
    },

	/**
	 * Authorize
	 * No equivalent so mapped to approvals.
	 */
    isAuthorize: function() {
		if (!this.plugin.foundation)
			return this.isApprovalRequested();
		
		return this.isState(this.LEGACY_STATE.AUTHORIZE);
    },

    changesToAuthorize: function() {
		return this._gr.approval.changes() && this.isAuthorize();
    },

    setAuthorize: function() {
		if (this.plugin.foundation)
			this.moveTo(this.LEGACY_STATE.AUTHORIZE);
		
		return true;
    },

    authorize: function() {
        return this.setAuthorize() && !!this._gr.update();
    },

	/**
	 * Scheduled
	 */
    isScheduled: function() {
		if (!this.plugin.foundation)
			return this.isNew();
		
		return this.isState(this.LEGACY_STATE.SCHEDULED);
    },

    changesToScheduled: function() {
        return this._gr.state.changes() && this.isScheduled();
    },

	setScheduled: function() {
		if (this.plugin.foundation)
			return this.moveTo(this.LEGACY_STATE.SCHEDULED);
		
		return true;
	},

	scheduled: function() {
		return this.setScheduled() && !!this._gr.update();
	},

	/**
	 * Implement
	 */
    isImplement: function() {
        return this.isState(this.LEGACY_STATE.IMPLEMENT);
    },

    changesToImplement: function() {
        return this._gr.state.changes() && this.isImplement();
    },

    setImplement: function() {
        return this.moveTo(this.LEGACY_STATE.IMPLEMENT);
    },

	implement: function() {
		return this.setImplement() && !!this._gr.update();
	},

	/**
	 * Review
	 * No equivalent in original state model so maps to WIP/Implement
	 */
    isReview: function() {
		if (!this.plugin.foundation)
			return this.isImplement();
		
		return this.isState(this.LEGACY_STATE.REVIEW);
    },

    changesToReview: function() {
		return this._gr.state.changes() && this.isReview();
    },

    setReview: function() {
		if (this.plugin.foundation)
			return this.moveTo(this.LEGACY_STATE.REVIEW);
		
		return true;
    },

	// Calls the noop method and then updates. Update may be expected after calling this method
    review: function() {
        return this.setReview() && !!this._gr.update();
    },
	
	/**
	 * Close
	 */
    isClosed: function() {
        return this._isStateMultiple(this.LEGACY_STATE.CLOSED);
    },

    changesToClosed: function() {
        return this._gr.state.changes() && this.isClosed();
    },

    isClosedSuccessful: function() {
		if (!this.plugin.foundation)
			return this.isState(this.LEGACY_CLOSE_STATE.SUCCESSFUL);
		
		return this.isClosed() && this._gr.getValue("close_code") === this.CLOSE_CODE.SUCCESSFUL;
    },

	isClosedSuccessfulWithIssues: function() {
		if (!this.plugin.foundation)
			return this.isState(this.LEGACY_CLOSE_STATE.SUCCESSFUL_ISSUES);
		
		return this.isClosed() && this._gr.getValue("close_code") === this.CLOSE_CODE.SUCCESSFUL_ISSUES;
	},

    isClosedUnsuccessful: function() {
		if (!this.plugin.foundation)
			return this.isState(this.LEGACY_CLOSE_STATE.UNSUCCESSFUL);
		
		return this.isClosed() && this._gr.getValue("close_code") === this.CLOSE_CODE.UNSUCCESSFUL;
    },
	
    setClose: function(closeCode, closeNotes) {
		var closeState = this.LEGACY_CLOSE_STATE.SUCCESSFUL;
		
		if (!this.plugin.foundation)  // We have legacy states
			closeState = closeCode === this.CLOSE_CODE.UNSUCCESSFUL ? this.LEGACY_CLOSE_STATE.UNSUCCESSFUL : this.LEGACY_CLOSE_STATE.SUCCESSFUL;
		
		if (this.plugin.change_management && closeNotes) // We have clode code
			this._gr.close_notes = closeNotes;
		
		return this.moveTo(closeState);
    },

	close: function(closeCode, closeNotes) {
		return this.setClose(closeCode, closeNotes) && !!this._gr.update();
	},

    closeSuccessful: function(closeNotes) {
        if (!closeNotes)
            closeNotes = gs.getMessage("Change closed successfully");

        return this.close(this.CLOSE_CODE.SUCCESSFUL, closeNotes);
    },

    closeSuccessfulWithIssues: function(closeNotes) {
        if (!closeNotes)
            closeNotes = gs.getMessage("Change closed successfully with issues");

        return this.close(this.CLOSE_CODE.UNSUCCESSFUL, closeNotes);
    },

    closeUnsuccessful: function(closeNotes) {
        if (!closeNotes)
            closeNotes = gs.getMessage("Change closed unsuccessfully");

        return this.close(this.CLOSE_CODE.UNSUCCESSFUL, closeNotes);
    },

	/**
	 * Cancel
	 */
    isCanceled: function() {
        return this.isState(this.LEGACY_STATE.CANCELED);
    },

    changesToCanceled: function() {
        return this._gr.state.changesTo(this.LEGACY_STATE.CANCELED);
    },

	setCancel: function() {
        return this.moveTo(this.LEGACY_STATE.CANCELED);
	},

    cancel: function() {
		return this.setCancel() && !!this._gr.update();
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
        return this._gr.insert();
    },

    update: function() {
        return this._gr.update();
    },
    
    refreshGlideRecord: function() {
        var gr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
        if (!gr.get(this._gr.getUniqueValue()))
            this._gr = null;


		this.initialize(gr);
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

	type: 'ChangeRequestChgReqAPISNC'
};

ChangeRequestChgReqAPISNC.newNormal = function() {
	return ChangeRequestChgReqAPI.newChange(ChangeRequest.NORMAL);
};

ChangeRequestChgReqAPISNC.newStandard = function() {
	return ChangeRequestChgReqAPI.newChange(ChangeRequest.STANDARD);
};

ChangeRequestChgReqAPISNC.newEmergency = function() {
	return ChangeRequestChgReqAPI.newChange(ChangeRequest.EMERGENCY);
};

ChangeRequestChgReqAPISNC.newChange = function(type) {
    var changeGr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
	changeGr.initialize();
	
	var changeRequest = new ChangeRequest(changeGr);
	changeRequest.newRecord();
	
    changeGr.setValue(changeRequest.getStateFieldName(), changeRequest.getInitialState());
    
    if (JSUtil.notNil(type))
        changeGr.setValue("type", type);

    return changeRequest;
};
