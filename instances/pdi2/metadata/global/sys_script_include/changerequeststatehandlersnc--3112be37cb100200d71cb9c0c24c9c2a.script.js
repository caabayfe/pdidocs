var ChangeRequestStateHandlerSNC = Class.create();

ChangeRequestStateHandlerSNC.LOG_PROPERTY = "com.snc.change_management.core.log";

ChangeRequestStateHandlerSNC.DRAFT = "draft";
ChangeRequestStateHandlerSNC.ASSESS = "assess";
ChangeRequestStateHandlerSNC.AUTHORIZE = "authorize";
ChangeRequestStateHandlerSNC.SCHEDULED = "scheduled";
ChangeRequestStateHandlerSNC.IMPLEMENT = "implement";
ChangeRequestStateHandlerSNC.REVIEW = "review";
ChangeRequestStateHandlerSNC.CLOSED = "closed";
ChangeRequestStateHandlerSNC.CANCELED = "canceled";

ChangeRequestStateHandlerSNC.CHG_TYPE_MODEL_CACHE = "com.snc.change_management.type_model_cache";

ChangeRequestStateHandlerSNC.prototype = {
	/**
	 * Keep a mapping of the state values and their label equivalent to make the models (ChangeRequestStateModel_normal...etc)
	 * easier to work with
	 */
	STATE_NAMES: {
		"-5": ChangeRequestStateHandlerSNC.DRAFT,
		"-4": ChangeRequestStateHandlerSNC.ASSESS,
		"-3": ChangeRequestStateHandlerSNC.AUTHORIZE,
		"-2": ChangeRequestStateHandlerSNC.SCHEDULED,
		"-1": ChangeRequestStateHandlerSNC.IMPLEMENT,
		"0": ChangeRequestStateHandlerSNC.REVIEW,
		"3": ChangeRequestStateHandlerSNC.CLOSED,
		"4": ChangeRequestStateHandlerSNC.CANCELED
	},
	
	STATE_VALUES: null,

	NORMAL: "normal",
	EMERGENCY: "emergency",
	STANDARD: "standard",

	DEFAULT_MODEL_CLASS: "ChangeRequestStateModel_normal",

	/**
	 * @param changeRequestGr - GlideRecord
	 */
	initialize: function(changeRequestGr) {
		this._initPrivateCacheable(ChangeRequestStateHandlerSNC.CHG_TYPE_MODEL_CACHE);
		
		this.log = new GSLog(ChangeRequestStateHandlerSNC.LOG_PROPERTY, this.type);
		this.log.setLog4J();
		
		this._changeUtils = new ChangeUtils();

		if (!changeRequestGr)
			return;

		// If the we're enforcing data requirements, check approvals for change on canMove.
		this._checkApproval = gs.getProperty(ChangeRequestSNC.ENFORCE_DATA_REQ_PROP) === "true" ? true : false;
		
		this._gr = changeRequestGr;
		this._resetModel();
	},

	// Accepts state values and the 'known names' (above) of legacy states
	isNext: function(state) {
		state = state+"";
		var nextStates = this.getNextStates();
		
		if (!nextStates)
			return false;
		
		// Always compare values so assume state is a value if there's no name for it
		state = this.getStateValue(state);
		
		var isNextState = false;
		nextStates.some(function(nextState) {
			nextState = this.getStateValue(nextState);
			isNextState = (state === nextState);
			return isNextState;
		}, this);

		return isNextState;
	},

	/**
	 * Moves the change request to the next state.
	 * 
	 * The record's state is set but the record is not saved.
	 * 
	 * @returns {Boolean}
	 */
	next: function() {
		var nextStates = this.getNextStates();
		
		if (!nextStates || nextStates.length == 0)
			return false;
		
		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[next] trying to move to " + nextStates[0]);

		var nextState = nextStates[0];
		if (!this.canMoveTo(nextState))
			return false;
		
		nextState = this.getStateValue(nextState);

		var currentState = this.getStateName(this._gr.getValue('state'));
		if (this._model[currentState][nextState])
			this._model[currentState][nextState].moving.call(this._model);
		this._gr.state = this.getStateValue(nextStates[0]);
		return true;
	},

	/**
	 * Moves the change request to the given state
	 * 
	 * The record's state is set but the record is not saved.
	 * 
	 * @param toState String - name of the state to move to
	 * @returns {Boolean}
	 */
	moveTo: function(toState) {
		if (!this.canMoveTo(toState))
			return false;
				
		var currentState = this.getStateName(this._gr.getValue('state'));
		this._model[currentState][toState].moving.call(this._model);
		this._gr.state = this.getStateValue(toState);
		return true;
	},

	/**
	 * Confirms that the move was allowed and executes the 'moving' function for this specific transition
	 * 
	 * @param toState String - name of the state to move to
	 * @returns {Boolean}
	 */
	moveFrom: function(fromState) {
		if (!this.canMoveFrom(fromState))
			return false;
		
		var currentState = this.getStateName(this._gr.getValue('state'));
		if (this._model[fromState] && this._model[fromState][currentState])
			this._model[fromState][currentState].moving.call(this._model);

		return true;
	},

	/**
	 * Checks if the change request at its current state is allowed to move to the given state
	 * 
	 * @param toState (optional) Name of the state
	 * @returns {Boolean}
	 */
	canMoveTo: function(toState) {
		if (!toState)
			return false;
		
		toState = toState + "";

		// The state needs to be a legacy name at this point, or a numeric for new states
		toState = this.STATE_NAMES[toState] || toState;
		
		var currentState = this.getStateName(this._gr.getValue('state'));
		
		// Legacy type based change
		// If we're enforcing data requirements, check approvals for all state changes apart from 'to draft' and 'to cancelled'
		if (currentState !== ChangeRequestStateHandler.DRAFT &&
			this._checkApproval &&
			toState !== ChangeRequestStateHandler.DRAFT &&
			toState !== ChangeRequestStateHandler.CANCELED &&
			(this._gr.approval + "" === "requested" || this._gr.approval + "" === "rejected"))
		{
			this.log.debug("[canMoveTo] Approval is required before state change");
			return false;
		}
		
		if (!this._model[currentState]) {
			this.log.debug("[canMoveTo] " + currentState + " is not a valid state for this change");
			return false;
		}

		if (this._model[currentState][toState])
			return this._model[currentState][toState].canMove.call(this._model);

		if (this.log.atLevel(GSLog.DEBUG))
			this.log.debug("[canMoveTo] " + toState + " is not a valid state to move to");

		return false;
	},

	/**
	 * Checks if the change request at its current state was allowed to move from the state provided
	 * 
	 * @param fromState (optional) Name of the state
	 * @returns {Boolean}
	 */
	canMoveFrom: function(fromState) {
		if (!fromState)
			return false;

		fromState = fromState + "";

		// The state needs to be a legacy name at this point, or a numeric for new states
		fromState = this.STATE_NAMES[fromState] || fromState;
		
		// Legacy type based change
		var currentState = this.getStateName(this._gr.getValue('state'));
		if (!this._model[currentState]) {
			this.log.debug("[canMoveFrom] " + currentState + " is not a valid state for this change");
			return false;
		}

		if (!this._model[fromState]) {
			this.log.debug("[canMoveFrom] " + fromState + " is not a valid state for this change to have moved from");
			return false;
		}

		if (this._model[fromState][currentState])
			return this._model[fromState][currentState].canMove.call(this._model);

		this.log.debug("[canMoveFrom] " + currentState + " is not a valid state to move from " + fromState);

		return false;
	},
	/**
	 * Returns the array of next states this change to may move to.
	 * 
	 * The array will be made up of legacy state names (shown above) if there is a name for the value,
	 * and state values to accommodate any new states added via the model
	 */
	getNextStates: function() {
		var currentState = null;
		//If we're dealing with a change model
		
		// Legacy Type based changes
		currentState = this.getStateName(this._gr.getValue('state'));
		if (!currentState)
			return null;

		var stateObj = this._model[currentState];

		if (!stateObj) {
			this.log.debug("[getNextStates] " + currentState + " is not a valid state for this change");
			return null;
		}

		if (!stateObj.nextState || stateObj.nextState.length === 0) {
			this.log.debug("[getNextStates] there is no 'next' state to move to from '" + currentState + "'");
			return null;
		}

		return stateObj.nextState;
	},

	getAvailableStates: function() {
		var currentState = null;

		// Legacy Type based changes
		currentState = this.getStateName(this._gr.getValue('state'));
		if (!currentState)
			return null;

		var stateObj = this._model[currentState];

		if (!stateObj) {

			if (this.log.atLevel(GSLog.DEBUG))
				this.log.debug("[getAvailableStates] " + currentState + " is not a valid state for this change");

			return null;
		}

		var availableStates = Object.keys(stateObj).filter(function(elem) {
			return elem.indexOf('nextState') === -1;
		});

		if (!availableStates || availableStates.length === 0) {

			if (this.log.atLevel(GSLog.DEBUG))
				this.log.debug("[getAvailableStates] there is no 'next' state to move to from '" + currentState + "'");

			return null;
		}

		return availableStates;
	},

	/**
	 * Dissociate approvals from a particular workflow activity to preserve the history.
	 */
	disassociateApprovalsFromWorkflow: function() {
		if (!this._gr)
			return;

		var existingApprovalsGr = new GlideMultipleUpdate("sysapproval_approver");
		existingApprovalsGr.addQuery("sysapproval", this._gr.getUniqueValue());
		existingApprovalsGr.addQuery("state", "!=", "cancelled");
		existingApprovalsGr.setValue("wf_activity", "");
		existingApprovalsGr.execute();

		existingApprovalsGr = new GlideMultipleUpdate("sysapproval_group");
		existingApprovalsGr.addQuery("parent", this._gr.getUniqueValue());
		existingApprovalsGr.addQuery("approval", "!=", "cancelled");
		existingApprovalsGr.setValue("wf_activity", "");
		existingApprovalsGr.execute();
	},

	/**
	 * Uses the current change request's type to determine and set the state model class
	 */
	_resetModel: function() {
		this._model = null;
		switch (this._gr.getValue('type') + "") {
			case this.NORMAL:
				this._model = new ChangeRequestStateModel_normal(this._gr);
				break;
			case this.EMERGENCY:
				this._model = new ChangeRequestStateModel_emergency(this._gr);
				break;
			case this.STANDARD:
				this._model = new ChangeRequestStateModel_standard(this._gr);
				break;
			default:
				this._model = this._deriveModel();
				break;
		}
	},
	
	getStateModel: function() {
		var stateModel = {};
		stateModel['types'] = [];
		stateModel['stateValueByName'] = {};
		stateModel['stateNameByValue'] = {};
		stateModel['stateLabelByValue'] = {};
		
		var states = this._changeUtils.getFieldChoices('state');
		for (var i = 0; i < states.size(); i++) {
			var state = states.get(i);
			var stateValue = state.getValue();
			stateModel.stateLabelByValue[stateValue] = state.getLabel();
			var stateName = this.getStateName(stateValue);
			if (stateName) {
				stateModel.stateNameByValue[stateValue] = stateName;
				stateModel.stateValueByName[stateName] = stateValue;
			}
		}

		var chgTypes = this._changeUtils.getFieldChoices('type');
		if (!chgTypes || chgTypes.size() == 0)
			return stateModel;
		
		for (var i = 0; i < chgTypes.size(); i++) {
			var chgType = chgTypes.get(i);
			var chgTypeValue = chgType.getValue();
			if (!chgTypeValue)
				continue;
			stateModel.types.push(chgTypeValue);
			stateModel[chgTypeValue] = this._getStateModelByType(chgTypeValue);
		}
		
		return stateModel;
	},
	
	_getStateModelByType: function(type) {
		var typeStateModel = {};
		
		var outerScope = JSUtil.getGlobal();
		var changeRequestStateModel_type = "ChangeRequestStateModel_" + type; 
		var stateModelClass = outerScope[changeRequestStateModel_type].prototype;
		if (typeof stateModelClass === "undefined")
			return typeStateModel;

		var stateValues = Object.keys(this.STATE_NAMES);
		for (var i = 0; i < stateValues.length; i++) {
			var stateName = this.getStateName(stateValues[i]);
			var stateInClass = stateModelClass[stateName];
			if (!stateInClass)
				continue;
			
			typeStateModel[stateName] = {nextState: []};
			if (stateInClass.nextState)
				typeStateModel[stateName].nextState = stateInClass.nextState;

			typeStateModel[stateName].availableStates = Object.keys(stateInClass).filter(function(elem) {
				return elem.indexOf('nextState') === -1;
			});
		}
		
		return typeStateModel;
	},

	// Return a know state name or the lookup value
	getStateName: function(stateValue) {
		return this.STATE_NAMES[stateValue + ""] || stateValue;
	},

	//Return a know state value or the lookup value
	getStateValue: function(stateName) {
		if (this.STATE_VALUES === null)
			this._initStateValue();
		return this.STATE_VALUES[stateName + ""] || stateName;
	},

	isOnHold: function() {
		return this._model.isOnHold.call(this._model);
	},

	_initStateValue: function() {
		this.STATE_VALUES = {};
		Object.keys(this.STATE_NAMES).forEach(function(legacyState) {
			this.STATE_VALUES[this.STATE_NAMES[legacyState]] = legacyState;
		}, this);
	},

	_initPrivateCacheable: function(name) {
		if (!name)
			return;
		if (GlideCacheManager.get(name, "_created_") !== null)
			return;
		GlideCacheManager.addPrivateCacheable(name);
		GlideCacheManager.put(name, "_created_", new GlideDateTime().getNumericValue());
	},

	_deriveModel: function() {
		var type = this._gr.getValue("type");
		if (!type) {
			this.log.logWarning("_deriveModel: " + this._gr.getDisplayValue() + " type not specified. Using the " + this.DEFAULT_MODEL_CLASS + " script include.");
			return this._getModel(this.DEFAULT_MODEL_CLASS);
		}

		// Already know the script-include required
		var scriptInclude = GlideCacheManager.get(ChangeRequestStateHandlerSNC.CHG_TYPE_MODEL_CACHE, type);
		if (scriptInclude instanceof String)
			return this._getModel(scriptInclude);

		// Specific naming of models for Change Types is required and outlined in documentation
		var scriptIncludeName = "ChangeRequestStateModel_" + type;
		var scriptIncludeGR = new GlideRecord("sys_script_include");
		scriptIncludeGR.addQuery("name", scriptIncludeName);
		scriptIncludeGR.addActiveQuery();
		scriptIncludeGR.setLimit(1);
		scriptIncludeGR.query();

		// By default we use the DEFAULT_MODEL_CLASS implementation
		if (!scriptIncludeGR.next()) {
			this.log.logWarning("_deriveModel: " + this._gr.getDisplayValue() + " Cannot find the " + scriptIncludeName + " script include for type of " + type + ". Using the " + this.DEFAULT_MODEL_CLASS + " script include.");
			return this._getModel(this.DEFAULT_MODEL_CLASS);
		}

		var apiName = scriptIncludeGR.getValue("api_name");
		// Still have nothing, just instantiate the default
		if (!apiName) {
			this.log.logWarning("_deriveModel: " + this._gr.getDisplayValue() + " Cannot get the API name from the " + scriptIncludeName + " script include. Using the " + this.DEFAULT_MODEL_CLASS + " script include.");
			return this._getModel(this.DEFAULT_MODEL_CLASS);
		}

		var model = this._getModel(apiName);
		if (typeof model !== "object") {
			this.log.logWarning("_deriveModel: " + this._gr.getDisplayValue() + " Cannot instantiate the " + apiName + " script include. Using the " + this.DEFAULT_MODEL_CLASS + " script include.");
			return this._getModel(this.DEFAULT_MODEL_CLASS);
		}

		// Cache the corresponding script-include for this type
		GlideCacheManager.put(ChangeRequestStateHandlerSNC.CHG_TYPE_MODEL_CACHE, type, apiName);

		return model;
	},

	_getModel: function (scriptInclude) {
		var modelClass = new GlideScriptEvaluator().evaluateString(scriptInclude, true);
		return new modelClass(this._gr);
	},

	type: "ChangeRequestStateHandlerSNC"
};
