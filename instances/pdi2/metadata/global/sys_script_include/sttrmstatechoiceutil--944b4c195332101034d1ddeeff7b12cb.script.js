var STTRMStateChoiceUtil = Class.create();
STTRMStateChoiceUtil.prototype = {
	initialize: function(model) {
		this._model = model;
	},
	
	getAvailableChoices: function(currState) {
		if (!this._model || !this._model.isValidRecord())
			return [];
		
		var sysChoiceGr = this._getSysChoices();
		
		var existingStateGr = new GlideRecord("sttrm_state");
		existingStateGr.addQuery("sttrm_model", this._model.getUniqueValue());
		existingStateGr.query();
		
		// Exclude the used states but keep the current state
		var excludeChoices = [];
		while (existingStateGr.next()) {
			if (currState && currState.getUniqueValue() === existingStateGr.getUniqueValue())
				continue;
			
			excludeChoices.push(existingStateGr.getValue("state_value"));
		}
		
		var fieldChoices = [];
		while (sysChoiceGr.next()) {
			if (sysChoiceGr.getValue("inactive") === "1" || excludeChoices.indexOf(sysChoiceGr.getValue("value") + "") !== -1)
				continue;
			
			fieldChoices.push(this._choiceToJS(sysChoiceGr));
		}
		
		return fieldChoices;
	},
	
	// Returns the choice list info for the state provided
	getChoiceInfo: function(stateGr) {
		if (!stateGr || !stateGr.isValidRecord())
			return null;
		
		var sysChoiceGr = this._getSysChoices();
		var retVal = null;
		
		while (sysChoiceGr.next()) {
			if (sysChoiceGr.getValue("inactive") === "1")
				continue;
			
			if (sysChoiceGr.getValue("value") === stateGr.getValue("state_value")) {
				retVal = this._choiceToJS(sysChoiceGr);
				break;
			}
		}
		
		return retVal;
	},
	
	// Returns the choice list info for all states provided 
	getChoicesInfo: function(stateGr) {
		if (!stateGr || !stateGr.hasNext())
			return [];
		
		var stateValues = [];
		while (stateGr.next())
			stateValues.push(stateGr.getValue("state_value"));
		
		var retVal = [];
		var sysChoiceGr = this._getSysChoices();
		while(sysChoiceGr.next()) {
			if (sysChoiceGr.getValue("inactive") === "1")
				continue;
			
			if (stateValues.indexOf(sysChoiceGr.getValue("value")) !== -1)
				retVal.push(this._choiceToJS(sysChoiceGr));
		}
		return retVal;
	},
	
	_getSysChoices: function() {
		var choiceGr = new GlideSysChoice(
			this._model.getValue("table_name"),
			this._model.getValue("state_field")
		).getChoices();
		return choiceGr;
	},
		
	_choiceToJS: function(sysChoiceGr) {
		return {
			"value": sysChoiceGr.getValue("value"),
			"label": sysChoiceGr.getDisplayValue("label"),
			"sequence": sysChoiceGr.getValue("sequence")
		};
	},
	
	type: 'STTRMStateChoiceUtil'
};
