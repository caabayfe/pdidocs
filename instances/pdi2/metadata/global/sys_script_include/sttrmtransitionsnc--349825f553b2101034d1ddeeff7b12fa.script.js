var STTRMTransitionSNC = Class.create();
STTRMTransitionSNC.prototype = {
    initialize: function(stateTransitionGr, _gs) {
		this._gr = stateTransitionGr;
		this._gs = _gs || gs;
    },
	
	// Evaluates the conditions associated to this transition against the processGr
	// Returns true if the condition is available
	evaluateConditions: function(processGr) {
		var retVal = this.toJS();
		retVal.transition_available = true;
		retVal.automatic_transition = this._gr.getValue("automatic") === "1" ? true : false;
		retVal.conditions =  [];
		
		var conditionGr = new GlideRecord("sttrm_transition_condition");
		conditionGr.addQuery("sttrm_state_transition", this._gr.getUniqueValue());
		conditionGr.addActiveQuery();
		conditionGr.query();
		
		if (!conditionGr.hasNext())
			return retVal; // If there are no conditions you can always transition
		
		// From this point on we need something to evaluate against
		if (!processGr) {
			retVal.transition_available = false;
			return retVal;
		}
		
		while (conditionGr.next()) {
			var sttrmCondition = new STTRMCondition(conditionGr);
			var condition = {
				"passed": sttrmCondition.evaluate(processGr),
				"condition": sttrmCondition.toJS()
			};
			retVal.transition_available = retVal.transition_available && condition.passed;
			retVal.conditions.push(condition);
		}

		return retVal;
	},
	
	// Reference Qualifiers used when building models
	getStateRefQual: function() {
		return "sttrm_model=" + this._gr.from_state.getRefRecord().getValue("sttrm_model");
	},

	getTransitionStateRefQual: function() {
		return this.getStateRefQual() + "^sys_id!=" + this._gr.getValue("from_state");
	},

	getTransitionConditions: function() {
		var conditionGr = new GlideRecord("sttrm_transition_condition");
		conditionGr.addQuery("sttrm_state_transition", this._gr.getUniqueValue());
		conditionGr.query();

		return conditionGr;
	},

	toJS: function() {
		return {
			sys_id: this._gr.getUniqueValue(),
			display_value: this._gr.getDisplayValue(),
			from_state: this._gr.from_state.getRefRecord().getValue("state_value"),
			to_state: this._gr.to_state.getRefRecord().getValue("state_value")
		};
	},

    type: 'STTRMTransitionSNC'
};
