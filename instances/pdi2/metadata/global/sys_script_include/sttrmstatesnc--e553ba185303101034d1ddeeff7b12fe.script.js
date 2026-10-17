var STTRMStateSNC = Class.create();
STTRMStateSNC.prototype = {
    initialize: function(stateGr, _gs) {
		this._gr = stateGr;
		this._gs = _gs || gs;
    },
	
	// Returns attributes related to this state
	getAttributes: function() {
		var stateAttributeGr = new GlideRecord("sttrm_state_attribute");
		stateAttributeGr.addActiveQuery();
		stateAttributeGr.addQuery("sttrm_state", this._gr.getUniqueValue());
		stateAttributeGr.query();

		var attributeIds = [];
		while (stateAttributeGr.next()) {
			attributeIds.push(stateAttributeGr.getValue("sttrm_attribute"));
		}

		var attributeGr = new GlideRecord("sttrm_attribute");
		attributeGr.addQuery("sys_id", "IN", attributeIds);
		attributeGr.query();

		return attributeGr;
	},

	// Returns a transition(s) to the provided state or null
	getTransition: function(toState, transitionType) {	
		var transitionGr = this._configTransitionGr();
		
		if (transitionType)
			if (transitionType === "manual")
				transitionGr.addQuery("automatic", false);
			else if (transitionType === "automatic")
				transitionGr.addQuery("automatic", true);
		
		if (this._isGlideRecord(toState))
			transitionGr.addQuery("to_state", toState.getUniqueValue());
		else
			transitionGr.addQuery("to_state.state_value", toState);
		transitionGr.query();

		if (!transitionGr.hasNext())
			return null;

		return transitionGr;
	},
	
	// Returns a manual transition(s) to the provided toState or null
	getManualTransition: function(toState) {
		return this.getTransition(toState, "manual");
	},
	
	// Returns an automatic transition(s) to the provided toState or null
	getAutomaticTransition: function(toState) {
		return this.getTransition(toState, "automatic");
	},
	
	// Returns all transitions from this state
	getTransitions: function() {
		var transitionGr = this._configTransitionGr();
		transitionGr.query();
		return transitionGr;
	},
	
	// Returns all automatic transitions from this state
	getAutomaticTransitions: function() {
		var transitionGr = this._configTransitionGr();
		transitionGr.addQuery("automatic", true);
		transitionGr.query();
		return transitionGr;
	},
	
	// Return all manual transitions from this state
	getManualTransitions: function() {
		var transitionGr = this._configTransitionGr();
		transitionGr.addQuery("automatic", "!=", true);
		transitionGr.query();
		return transitionGr;
	},
	
	// Returns a GlideRecord of all states which can be transitioned to from this state
	getTransitionStates: function() {
		var transitionGr = this.getTransitions();
		return this._getStatesForTransitions(transitionGr);
	},
	
	// Returns a GlideRecord of states which are manual transitions from this state
	getManualTransitionStates: function() {
		var transitionGr = this.getManualTransitions();
		return this._getStatesForTransitions(transitionGr);
	},
	
	// Returns a GlideRecord of states which are automatic transitions from this state
	getAutomaticTransitionStates: function() {
		var transitionGr = this.getAutomaticTransitions();
		return this._getStatesForTransitions(transitionGr);
	},
	
	_configTransitionGr: function() {
		var transitionGr = new GlideRecord("sttrm_state_transition");
		transitionGr.addQuery("from_state", this._gr.getUniqueValue());
		transitionGr.orderBy("to_state.state_sequence");
		return transitionGr;
	},
	
	// Returns a stateGr containing all the states for the provided transitions
	_getStatesForTransitions: function(transitionGr) {
		if (!transitionGr || !transitionGr.hasNext())
			return null;
		
		var stateSysIds = [];
		while (transitionGr.next())
			stateSysIds.push(transitionGr.getValue("to_state"));
		
		var stateGr = new GlideRecord("sttrm_state");
		stateGr.addQuery("sttrm_model", this._gr.getValue("sttrm_model"));
		stateGr.addQuery("sys_id","IN", stateSysIds);
		stateGr.orderBy("state_sequence");
		stateGr.query();
		
		return stateGr;
	},
	
	_getStateInfo: function(transitionGr) {
		stateGr = this._getStatesForTransitions(transitionGr);
		if (!stateGr)
			return null;
		
		return new STTRMStateChoiceUtil(this._gr.sttrm_model.getRefRecord()).getChoicesInfo(stateGr);
	},
	
	_isGlideRecord: function(inputVar) {
		return inputVar && typeof inputVar.getTableName === "function";
	},
	
	// toJS for this record or for a GlideRecord of multiple states
	toJS: function() {
		//Get latest values from the choice list rather than this object.
		return new STTRMStateChoiceUtil(this._gr.sttrm_model.getRefRecord()).getChoiceInfo(this._gr);
	},
	
    type: 'STTRMStateSNC'
};
