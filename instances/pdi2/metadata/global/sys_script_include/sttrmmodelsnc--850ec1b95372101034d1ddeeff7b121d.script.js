var STTRMModelSNC = Class.create();
STTRMModelSNC.prototype = {
    CACHE_NAME: "com.snc.itsm.state_transition_model",

    READ_ROLES: "read_roles",
    WRITE_ROLES: "write_roles",

    TABLES: {
        hide: "sttrm_model_user_criteria_hide_mtom",
        read_roles: "sttrm_model_user_criteria_read_mtom",
        write_roles: "sttrm_model_user_criteria_write_mtom"
    },

    LOG_PROPERTY: "com.snc.itsm.state_transition_model.log",

    initialize: function(stateTransitionModelGr, _gs) {
        this._gr = stateTransitionModelGr;
        this._gs = _gs || gs;
        this._log = new GSLog(this.LOG_PROPERTY, this.type).setLog4J();

        this._cached = null;
        this._idChk = null;
    },

    // Caching method, used internally
    _initCache: function() {
        if (GlideCacheManager.get(this.CACHE_NAME, "_created_") !== null)
            return;

        GlideCacheManager.addPrivateCacheable(this.CACHE_NAME);
        GlideCacheManager.put(this.CACHE_NAME, "_created_", new GlideDateTime().getNumericValue());
    },

    // Caching method, used internally
    _getCached: function() {
        if (!this._gr || !this._gr.isValidRecord())
            return this._memo();

        if (this._cached !== null && this._idChk === this._gr.getUniqueValue())
            return this._cached;

        this._idChk = this._gr.getUniqueValue();
        this._cached = GlideCacheManager.get(this.CACHE_NAME, this._gr.getUniqueValue());
        if (this._cached) {
            this._cached = JSON.parse(this._cached);
        } else {
            this._initCache();
            this._cached = this._memo();
            this._refreshCache();
        }

        return this._cached;
    },

    // Caching method, used internally
    _memo: function() {
        var memo = {
            "initial_state": null,
            "states": null,
            "terminal_states": null
        };

        if (!this._gr || !this._gr.isValidRecord())
            return memo;

        var initialStateGr = this.getInitialState();
        if (initialStateGr)
            memo.initial_state = initialStateGr.getValue("state_value");

        var stateGr = this.getStates();
        if (stateGr.hasNext())
            memo.states = [];
        while (stateGr.next())
            memo.states.push(stateGr.getValue("state_value"));

        var terminalStateGr = this.getTerminalStates();
        if (terminalStateGr.hasNext())
            memo.terminal_states = [];
        while (terminalStateGr.next())
            memo.terminal_states.push(terminalStateGr.getValue("state_value"));

        return memo;
    },

    // Caching method, used internally
    _refreshCache: function() {
        if (!this._gr || !this._gr.isValidRecord())
            return;

        GlideCacheManager.put(this.CACHE_NAME, this._gr.getUniqueValue(), JSON.stringify(this._getCached()));
    },

    // Allow extensions and tools using the sttr models to augment the cache
    addToCache: function(key, value) {
        this._getCached()[key] = value;
        this._refreshCache();
    },

    // Returns a value from the cache or null
    getFromCache: function(key) {
        return this._getCached()[key] || null;
    },

    // Methods for using models
    // Applies the initial state for the model
    // * processGr: The gr to evaluate the transition to the initial state on
    // * modelChanged: True if you are switching between models and don't want to evaluate the transition
    applyInitialState: function(processGr, modelChanged) {
        var initialStateGr = this.getInitialState();
        if (initialStateGr === null || !this._validProcessTable(processGr))
            return false;

        // If it's not new, go through the usual checks
        if (processGr.isNewRecord() || modelChanged) {
            processGr.setValue(this.getStateFieldName(), initialStateGr.getValue("state_value"));
            return true;
        }

        return this.applyState(processGr, initialStateGr);
    },

    // Apply a state value to the processGr for this model
    // Returns false if the state cannot be applied
    applyState: function(processGr, state) {
        var stateGr = this.getState(state);
        if (stateGr === null || !this._validProcessTable(processGr))
            return false;

        if (this.canTransition(processGr, stateGr)) {
            processGr.setValue(this.getStateFieldName(), stateGr.getValue("state_value"));
            return true;
        }

        return false;
    },

    // Evaluates the automated transitions for a process record and sets state if applicable
    // Returns true if a state transition was applied, false otherwise
    applyAutomaticTransition: function(processGr) {
        var stateGr = this.getState(processGr);
        if (!stateGr)
            return false;

        var state = new STTRMState(stateGr);
        var transitionGr = state.getAutomaticTransitions();
        while (transitionGr.next()) {
            var evaluated = new STTRMTransition(transitionGr).evaluateConditions(processGr);
            if (evaluated.transition_available) {
                processGr.setValue(this.getStateFieldName(), evaluated.to_state);
                return true;
            }
        }
        return false;
    },

    // Gets the name of the field being used to store state
    getStateFieldName: function() {
        return this._gr.getValue("state_field");
    },

    // Returns all states for the model
    getStates: function() {
        var statesGr = new GlideRecord("sttrm_state");
        statesGr.addQuery("sttrm_model", this._gr.getUniqueValue());
        statesGr.orderBy("state_sequence");
        statesGr.query();
        return statesGr;
    },

    // Convenience method to return an array of the states values 
    getStatesValues: function() {
        return this.getFromCache("states");
    },

    // Returns the sttrm_state GlideRecord or null for a given state value or process record
    getState: function(processGrOrStateValue) {
        if (!processGrOrStateValue)
            return null;

        var stateValue = processGrOrStateValue;
        if (this._isGlideRecord(processGrOrStateValue)) {
            if (processGrOrStateValue.getTableName() === "sttrm_state") {
                // Check if it's a valid record and if it's a state record from this model
                if (processGrOrStateValue.isValidRecord() && processGrOrStateValue.getValue("sttrm_model") === this._gr.getUniqueValue())
                    return processGrOrStateValue;

                return null;
            }

            if (!this._validProcessTable(processGrOrStateValue))
                return null;

            stateValue = processGrOrStateValue.getValue(this.getStateFieldName());
        }

        var stateGr = new GlideRecord("sttrm_state");
        stateGr.addQuery("sttrm_model", this._gr.getUniqueValue());
        stateGr.addQuery("state_value", stateValue);
        stateGr.query();

        if (!stateGr.next())
            return null;

        return stateGr;
    },

    // Convenience method to get the value of a state.  Uses the cached version of the model
    getStateValue: function(processGrOrStateValue) {
        if (!processGrOrStateValue)
            return null;

        var stateValue = processGrOrStateValue;

        // Cater for cases where a GlideRecord is passed in
        if (this._isGlideRecord(processGrOrStateValue)) {
            if (processGrOrStateValue.getTableName() === "sttrm_state") {
                // Check if it's a valid record and if it"s a state record from this model
                if (processGrOrStateValue.isValidRecord() && processGrOrStateValue.getValue("sttrm_model") === this._gr.getUniqueValue())
                    return processGrOrStateValue.getValue("state_value");

                return null;
            }

            if (!this._validProcessTable(processGrOrStateValue))
                return null;

            //Even though this is a valid process table we need to check if the state exists in the model
            stateValue = processGrOrStateValue.getValue(this.getStateFieldName());
        }

        if (this.getFromCache("states").indexOf(stateValue) !== -1)
            return stateValue;

        return null;
    },

    // Returns the attributes associated to the provided state
    getStateAttributes: function(processGrOrStateValue) {
        var currentStateGr = this.getState(processGrOrStateValue);
        if (!currentStateGr) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getStateAttributes] GlideRecord " + this._gr.getDisplayValue() + "[" +
                    this._gr.getTableName() + ":" + this._gr.getUniqueValue() +
                    "] is not in a valid state for this model [" + this._gr.getValue("state") + "]");
            return null;
        }

        return new STTRMState(currentStateGr).getAttributes();
    },

    // Returns the values of the attributes associated to the provided state.
    // Uses cached values
    getStateAttributesValues: function(processGrOrStateValue) {
        if (!processGrOrStateValue)
            return null;

        var cachedStateAttributes = this.getFromCache("state_attributes") || {};
        var stateValue = this.getStateValue(processGrOrStateValue);

        if (typeof cachedStateAttributes[stateValue] !== "undefined")
            return cachedStateAttributes[stateValue];

        var attributesGr = this.getStateAttributes(processGrOrStateValue);
        var attributeNames = [];
        while (attributesGr.next()) {
            attributeNames.push(attributesGr.getValue("name"));
        }

        cachedStateAttributes[stateValue] = attributeNames;
        this.addToCache("state_attributes", cachedStateAttributes);

        return attributeNames;
    },

    // Returns true if the provided state has the attribute attributeName
    hasStateAttribute: function(processGrOrStateValue, attributeName) {
        var stateAttributes = this.getStateAttributesValues(processGrOrStateValue) || [];
        return stateAttributes.indexOf(attributeName) !== -1;
    },

    // Returns a set of the attributes which the model contains
    getContainedAttributes: function() {
        var containsAttribute = this.getFromCache("contains_attribute") || null;
        if (containsAttribute)
            return containsAttribute;

        containsAttribute = [];
        var states = this.getStatesValues();
        for (var i = 0; i < states.length; i++) {
            var attributes = this.getStateAttributesValues(states[i]);
            for (var j = 0; j < attributes.length; j++) {
                if (containsAttribute.indexOf(attributes[j]) === -1)
                    containsAttribute.push(attributes[j]);
            }
        }

        this.addToCache("contains_attribute", containsAttribute);
        return containsAttribute;
    },

    // Determines if the model has the provided attributeName associated to any state
    containsAttribute: function(attributeName) {
        if (!attributeName)
            return null;

        return this.getContainedAttributes().indexOf(attributeName) !== -1;
    },

    // Returns the possible transition states for the state of provided processGr or state value
    getTransitionStates: function(processGrOrStateValue) {
        var currentStateGr = this.getState(processGrOrStateValue);
        if (!currentStateGr) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getTransitionStates] GlideRecord " + this._gr.getDisplayValue() + "[" +
                    this._gr.getTableName() + ":" + this._gr.getUniqueValue() +
                    "] is not in a valid state for this model [" + this._gr.getValue("state") + "]");
            return null;
        }

        return new STTRMState(currentStateGr).getTransitionStates();
    },

    // Convenience method to get the transition state values. Uses the cached version of the model
    getTransitionStatesValues: function(processGrOrStateValue) {
        if (!processGrOrStateValue)
            return null;

        var cachedTransitionStates = this.getFromCache("transition_states");
        var stateValue = this.getStateValue(processGrOrStateValue);

        if (cachedTransitionStates && cachedTransitionStates[stateValue])
            return cachedTransitionStates[stateValue];

        var transitionStateGr = this.getTransitionStates(processGrOrStateValue);

        var transitionStates = [];
        while (transitionStateGr && transitionStateGr.next()) {
            transitionStates.push(transitionStateGr.getValue("state_value"));
        }

        var allTransitionStates = cachedTransitionStates || {};
        allTransitionStates[stateValue] = transitionStates;
        this.addToCache("transition_states", allTransitionStates);

        return transitionStates;
    },

    // Returns the manual transition states for the provided the state or processGr
    getManualTransitionStates: function(processGrOrStateValue) {
        var currentStateGr = this.getState(processGrOrStateValue);
        if (!currentStateGr) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getManualTransitionStates] GlideRecord " + this._gr.getDisplayValue() + "[" +
                    this._gr.getTableName() + ":" + this._gr.getUniqueValue() +
                    "] is not in a valid state for this model [" + this._gr.getValue("state") + "]");
            return null;
        }

        return new STTRMState(currentStateGr).getManualTransitionStates();
    },

    /* Returns true if the model allows transition between the process GlideRecord"s current state
     * and the to state.
     *
     * At least one process gliderecord has to be provided (from takes precident). "to" can be a
     * second process GR, a state GR from the model or a state value.
     */
    canTransition: function(fromProcessGrOrState, toProcessGrOrState) {
        this.transitionResult = this.evaluateTransition(fromProcessGrOrState, toProcessGrOrState);
        return this.transitionResult.transition_available;
    },

    /* Evaluates the transition between the process GlideRecord"s current state and the to state.
     * Returns a minimum of the following:
     * {
     *		transition_available: false,
     *		// And if valid from and two states are provided
     *		from_state: "fromStateValue",
     *		to_state: "toStateValue"
     * }
     *
     * If a valid transition is found:
     * {
     *		sys_id: "sys_id of the transition",
     *		display_value: "Display Value for the transition",
     *		from_state: "fromStateValue",
     *		to_state: "toStateValue"
     *		transition_available: true/false,
     *		conditions: [
     *		{
     *			passed: true/false,
     *			condition: {
     *				"name": "Name given to the condition",
     *				"description": "Description of the condition",
     *				"sys_id": "sys_id of the condition"
     *			}
     *		}
     *		...
     *		]
     * }
     *
     * At least one process gliderecord has to be provided ("from" takes precident). "to" can be a
     * second process GR, an sttrm_state GR from the model or a state value.
     */
    evaluateTransition: function(fromProcessGrOrState, toProcessGrOrState) {
        var transitionResult = {
            transition_available: false
        };

        var evaluationGr = null;
        if (this._isGlideRecord(fromProcessGrOrState) && this._validProcessTable(fromProcessGrOrState))
            evaluationGr = fromProcessGrOrState;
        else if (this._isGlideRecord(toProcessGrOrState) && this._validProcessTable(toProcessGrOrState))
            evaluationGr = toProcessGrOrState;
        if (evaluationGr === null)
            return transitionResult;

        var fromState = this.getState(fromProcessGrOrState);
        if (!fromState)
            return transitionResult;

        var toState = this.getState(toProcessGrOrState);
        if (!toState)
            return transitionResult;

        transitionResult.from_state = fromState.getValue("state_value");
        transitionResult.to_state = toState.getValue("state_value");

        var transitionGr = new STTRMState(fromState).getTransition(toState);
        if (!transitionGr)
            return transitionResult;

        while (transitionGr.next()) {
            transitionResult = new STTRMTransition(transitionGr).evaluateConditions(evaluationGr);
            if (transitionResult.transition_available)
                break;
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[evaluateTransition] Evaluated transition:\n" + JSON.stringify(transitionResult, null, 3));

        return transitionResult;
    },

    /* Returns javascript array of field names that are mandatory for a given transition.
     * e.g. ["description", "assignment_group"]
     * 
     * It does NOT return a GlideRecord, as mandatory fields are of a different record type and structure.
     */
    getTransitionMandatoryFields: function(fromProcessGrOrState, toProcessGrOrState) {
        if (!fromProcessGrOrState || !toProcessGrOrState)
            return null;

        var fromState = this.getStateValue(fromProcessGrOrState);

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getTransitionMandatoryFields] fromState: " + fromState);

        if (fromState === null)
            return null;

        var toState = this.getStateValue(toProcessGrOrState);

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getTransitionMandatoryFields] toState: " + toState);

        if (toState === null)
            return null;

        var mandatoryFields = [];

        // Mandatory fields cache structure
        // {
        //     [fromState]: { [toState]: [] }
        // }
        var cachedMandatoryFields = this.getFromCache("mandatory_fields") || {};
        if (cachedMandatoryFields[fromState] && cachedMandatoryFields[fromState][toState]) {
            mandatoryFields = cachedMandatoryFields[fromState][toState];

            if (this._log.atLevel(global.GSLog.DEBUG))
                this._log.debug("[getTransitionMandatoryFields] cached mandatoryFields: " + JSON.stringify(mandatoryFields));

            return mandatoryFields;
        }

        var fromStateGr = this.getState(fromProcessGrOrState);
        var transitionGr = new STTRMState(fromStateGr).getTransition(toState);
        if (transitionGr && transitionGr.hasNext()) {
            while (transitionGr.next()) {
                var conditionGr = new STTRMTransition(transitionGr).getTransitionConditions();
                if (conditionGr === null)
                    continue;

                while (conditionGr.next()) {
                    if (conditionGr.getValue('condition_type') !== STTRM.MANDATORY_FIELDS)
                        if (conditionGr.condition_type.getRefRecord().getValue('condition_type') !== 'mandatory_fields')
                            continue;

                    if (conditionGr.getValue('condition_type') == STTRM.MANDATORY_FIELDS) {
                        mandatoryFields = mandatoryFields.concat(new STTRMCondition(conditionGr).toJS().mandatory_fields);
                        continue;
                    }

                    mandatoryFields = mandatoryFields.concat(new STTRMConditionType(conditionGr.condition_type.getRefRecord()).toJS().mandatory_fields);
                }
            }
        }

        // Mandatory fields cache structure
        // {
        //     [fromState]: { [toState]: [] }
        // }
        cachedMandatoryFields[fromState] = cachedMandatoryFields[fromState] ? cachedMandatoryFields[fromState] : {};
        cachedMandatoryFields[fromState][toState] = cachedMandatoryFields[fromState][toState] ? cachedMandatoryFields[fromState][toState] : [];
        cachedMandatoryFields[fromState][toState] = mandatoryFields;
        this.addToCache("mandatory_fields", cachedMandatoryFields);

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getTransitionMandatoryFields] cachedMandatoryFields: " + JSON.stringify(cachedMandatoryFields));

        return cachedMandatoryFields[fromState][toState];
    },

    // Returns an sttrm_state GlideRecord for initial state of a model or null
    getInitialState: function() {
        var stateGr = new GlideRecord("sttrm_state");
        stateGr.addQuery("sttrm_model", this._gr.getUniqueValue());
        stateGr.addQuery("initial_state", true);
        stateGr.orderBy("state_sequence");
        stateGr.setLimit(1);
        stateGr.query();
        if (stateGr.next())
            return stateGr;

        // If there is no initial set, return the first in the sequence of added states
        stateGr = new GlideRecord("sttrm_state");
        stateGr.addQuery("sttrm_model", this._gr.getUniqueValue());
        stateGr.orderBy("state_sequence");
        stateGr.setLimit(1);
        stateGr.query();

        if (stateGr.next())
            return stateGr;

        // If there are no records, return null
        return null;
    },

    // Convenience method to get the intial state value.  Uses cache
    getInitialStateValue: function() {
        return this.getFromCache("initial_state");
    },

    // Returns a sttrm_state GlideRecord containing all terminal states (no transitions)
    getTerminalStates: function() {
        var stateTransitionGr = new GlideRecord("sttrm_state_transition");
        stateTransitionGr.addQuery("from_state.sttrm_model", this._gr.getUniqueValue());
        stateTransitionGr.query();

        var stateSysIds = [];
        while (stateTransitionGr.next())
            stateSysIds.push(stateTransitionGr.getValue("from_state"));

        var stateGr = new GlideRecord("sttrm_state");
        stateGr.addQuery("sttrm_model", this._gr.getUniqueValue());
        stateGr.addQuery("sys_id", "NOT IN", stateSysIds);
        stateGr.orderBy("state_sequence");
        stateGr.query();
        return stateGr;
    },

    // Convenience method to get terminal state values.  Uses cache
    getTerminalStatesValues: function() {
        return this.getFromCache("terminal_states");
    },

    // Returns true if the processGr is in a terminal state
    inTerminalState: function(processGrOrState) {
        var cached = this._getCached();
        if (Array.isArray(cached.terminal_states)) {
            var stateValue = processGrOrState;
            if (this._isGlideRecord(processGrOrState))
                stateValue = processGrOrState.getTableName() === "sttrm_state" ?
                processGrOrState.getValue("state_value") : processGrOrState.getValue(this.getStateFieldName());

            return cached.terminal_states.indexOf(stateValue + "") !== -1;
        }

        // If there's no caching then use DB
        var stateGr = this.getState(processGrOrState);
        if (stateGr === null)
            return false;

        var terminalStateGr = this.getTerminalStates();

        while (terminalStateGr.next())
            if (terminalStateGr.getUniqueValue() === stateGr.getUniqueValue())
                return true;

        return false;
    },

    // Returns true if the processGr is in the initial state
    inInitialState: function(processGrOrState) {
        var cached = this._getCached();

        if (cached.initial_state !== null) {
            var stateValue = processGrOrState;
            if (this._isGlideRecord(processGrOrState))
                stateValue = processGrOrState.getTableName() === "sttrm_state" ?
                processGrOrState.getValue("state_value") : processGrOrState.getValue(this.getStateFieldName());

            return cached.initial_state === stateValue + "";
        }

        // If there's no caching use DB
        var stateGr = this.getState(processGrOrState);
        if (stateGr === null)
            return false;

        return this.getInitialState().getUniqueValue() === stateGr.getUniqueValue();
    },

    // Methods for building models
    // Returns the states which are available to use in the model.
    getAvailableStateChoices: function(selectedChoice) {
        var choices = this._getSysChoices();
        var existingStateGr = this.getStates();

        while (existingStateGr.next()) {
            if (existingStateGr.getValue("state_value") === selectedChoice)
                continue;
            choices.some(function(choice, idx) {
                if (choice.value === existingStateGr.getValue("state_value")) {
                    choices.splice(idx, 1);
                    return true;
                }
            });
        }

        return choices;
    },

    hasAvailableStates: function() {
        return this.getAvailableStateChoices().length > 0;
    },

    insertWithStates: function() {
        var targetModelSysId = this._copyModel();
        this._copyStates(targetModelSysId);
        return targetModelSysId;
    },

    canRead: function() {
        return this._gr.canRead();
    },

    evaluateReadSecurity: function() {
        // If a user has write access then they are automatically give read access
        var canWrite = this.evaluateWriteSecurity();
        if (canWrite)
            return canWrite;

        var canRead = this._evaluateSecurity(this.READ_ROLES);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[evaluateReadSecurity] canRead: " + canRead);

        return canRead;
    },

    canWrite: function() {
        return this._gr.canWrite();
    },

    evaluateWriteSecurity: function() {
        var canWrite = this._evaluateSecurity(this.WRITE_ROLES);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[evaluateWriteSecurity] canWrite: " + canWrite);

        return canWrite;
    },

    _evaluateSecurity: function(access) {
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateSecurity] access: " + access + " for: " + this._gr.getDisplayValue());

        if (!(access === this.READ_ROLES || access === this.WRITE_ROLES))
            return false;

        var user = this._gs.getUser();
        var roles = this._gr.getValue(access);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateSecurity] access: " + access + " roles: " + roles);

        var tableName = this._gr.getValue("table_name");
        if (!tableName)
            return false;

        var relatedTableGr = new GlideRecord(tableName);
        var canReadRelatedTable = relatedTableGr.canRead();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateSecurity] tableName: " + tableName + " canReadRelatedTable: " + canReadRelatedTable);

        var canCreateRelatedTable = relatedTableGr.canCreate();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateSecurity] tableName: " + tableName + " canCreateRelatedTable: " + canCreateRelatedTable);

        var canReadOrCreateRelatedTable = (canReadRelatedTable || canCreateRelatedTable);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateSecurity] tableName: " + tableName + " canReadOrCreateRelatedTable: " + canReadOrCreateRelatedTable);

        if (!canReadOrCreateRelatedTable)
            return false;

        if (roles && !this._gr.getElement(access).nil() && user.hasRole(roles))
            return true;

        var hasAdvancedSecurity = this._gr.getValue("advanced_security") + "" === "1";

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateSecurity] hasAdvancedSecurity: " + hasAdvancedSecurity);

        if (!hasAdvancedSecurity)
            return false;

        return this._evaluateUserCriteria(access, user.getID());
    },

    _evaluateUserCriteria: function(access, userSysId) {
        if (!(access === this.READ_ROLES || access === this.WRITE_ROLES))
            return false;

        if (!userSysId)
            return false;

        var sttrmModelSysId = this._gr.getUniqueValue();
        if (!sttrmModelSysId)
            return false;

        if (typeof sn_uc === "undefined" || typeof sn_uc.UserCriteriaLoader === "undefined")
            return false;

        var hideUserCriteriaSysIds = this._getUserCriteriaByMtom(this.TABLES.hide, sttrmModelSysId);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateUserCriteria] hideUserCriteriaSysIds: " + hideUserCriteriaSysIds);

        var userBlocked = sn_uc.UserCriteriaLoader.userMatches(userSysId, hideUserCriteriaSysIds);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateUserCriteria] userBlocked: " + userBlocked);

        // The Not Available For settings override Available For settings. A user on the Not Available For cannot access
        // that model, even if that user is also on the Available For list for that model.
        if (userBlocked)
            return false;

        var accessTable = this.TABLES[access];

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateUserCriteria] accessTable: " + accessTable + " userSysId: " + userSysId + " sttrmModelSysId: " + sttrmModelSysId);

        var userCriteriaSysIds = this._getUserCriteriaByMtom(accessTable, sttrmModelSysId);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateUserCriteria] userCriteriaSysIds: " + userCriteriaSysIds);

        var userHasAccess = sn_uc.UserCriteriaLoader.userMatches(userSysId, userCriteriaSysIds);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_evaluateUserCriteria] userHasAccess: " + userHasAccess);

        return userHasAccess;
    },

    _getUserCriteriaByMtom: function(accessTable, sttrmModelSysId) {
        var userCriteriaSysIds = this.getFromCache(accessTable);
        if (!Array.isArray(userCriteriaSysIds)) {
            userCriteriaSysIds = [];

            var gr = new GlideRecord(accessTable);
            gr.addActiveQuery();
            gr.addQuery("sttrm_model", sttrmModelSysId);
            gr.addNotNullQuery("user_criteria");
            gr.query();
            while (gr.next())
                userCriteriaSysIds.push(gr.getValue("user_criteria") + "");

            this.addToCache(accessTable, userCriteriaSysIds);
        }
        return userCriteriaSysIds;
    },

    canProposeTemplate: function() {
        if (!this._gr) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[canProposeTemplate] invalid model return false");

            return false;
        }

        var tableName = this._gr.getValue("table_name");
        if (!tableName)
            return false;

        var relatedTableGr = new GlideRecord(tableName);
        var canWriteRelatedTable = relatedTableGr.canWrite();

        if (!canWriteRelatedTable)
            return false;

        // Check user is able to propose a template
        var templateProposalAccess = this._gr.getValue("template_proposal_access");
        var accessRequired = JSUtil.nil(templateProposalAccess) ? "write" : templateProposalAccess;

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[canProposeTemplate] accessRequired: " + accessRequired);

        var isProposer = false;
        var canWriteModel = this.canWrite();
        if (canWriteModel) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[canProposeTemplate] canWriteModel: " + canWriteModel);

            return true;
        }

        if (accessRequired === "read" && this.canRead())
            isProposer = true;

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[canProposeTemplate] isProposer: " + isProposer);

        return isProposer;
    },

    copy: function() {
        var targetModelSysId = this._copyModel();
        var mappedStates = this._copyStates(targetModelSysId);
        var mappedTransitions = this._copyTransitions(mappedStates);
        this._copyTransitionConditions(mappedTransitions);
        return targetModelSysId;
    },

    _copyModel: function() {
        var fields = ChangeCommon.toJS(this._gr);
        var name = fields.name.value;
        var tableName = fields.sys_class_name.value;
        var gr = new GlideRecord(tableName);
        gr.initialize();
        for (var i = 0; i < Object.keys(fields).length; i++) {
            var fieldName = Object.keys(fields)[i];
            var value = fields[fieldName].value;
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[_createNewModel] Copying field: " + fieldName + " - value: " + value);
            gr.setValue(fieldName, value);
        }
        gr.setValue("name", gs.getMessage("{0} (copy)", name));
        gr.setValue("active", "false");
        gr.setValue("default_change_model", "false");
        return gr.insert();
    },

    _copyStates: function(newModelSysId) {
        var states = [];
        if (this._gr && this._gr.isValidRecord() && newModelSysId) {
            var sourceStateGr = this.getStates();
            var targetStateGr = new GlideRecord("sttrm_state");
            while (sourceStateGr.next()) {
                targetStateGr.initialize();
                targetStateGr.setValue("sttrm_model", newModelSysId);
                targetStateGr.setValue("state_value", sourceStateGr.getValue("state_value"));
                targetStateGr.setValue("state_label", sourceStateGr.getValue("state_label"));
                targetStateGr.setValue("state_sequence", sourceStateGr.getValue("state_sequence"));
                targetStateGr.setValue("initial_state", sourceStateGr.getValue("initial_state"));
                var sourceStateSysId = sourceStateGr.getUniqueValue();
                var targetStateSysId = targetStateGr.insert();
                states[sourceStateSysId] = targetStateSysId;

                this._copyStateAttributes(sourceStateSysId, targetStateSysId);
            }
        }
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_copyStates] States: " + JSON.stringify(states));

        return states;
    },

    _copyStateAttributes: function(sourceStateSysId, targetStateSysId) {

        if (!sourceStateSysId || !targetStateSysId)
            return;

        var targetStateAttributeGr = new GlideRecord("sttrm_state_attribute");
        var sourceStateAttributeGr = new GlideRecord("sttrm_state_attribute");
        sourceStateAttributeGr.addQuery("sttrm_state", sourceStateSysId);
        sourceStateAttributeGr.query();
        while (sourceStateAttributeGr.next()) {
            targetStateAttributeGr.initialize();
            targetStateAttributeGr.setValue("sttrm_state", targetStateSysId);
            targetStateAttributeGr.setValue("sttrm_attribute", sourceStateAttributeGr.getValue("sttrm_attribute"));
            targetStateAttributeGr.setValue("active", sourceStateAttributeGr.getValue("active"));
            targetStateAttributeGr.insert();
        }
    },

    _copyTransitions: function(mappedStates) {
        var transitions = {};
        var sourceTransitionsGr = this._getAllStateTransitionsGr();
        while (sourceTransitionsGr.next()) {
            var targetGr = new GlideRecord("sttrm_state_transition");
            targetGr.initialize();
            targetGr.setValue("automatic", sourceTransitionsGr.getValue("automatic"));
            targetGr.setValue("from_state", mappedStates[sourceTransitionsGr.getValue("from_state")]);
            targetGr.setValue("to_state", mappedStates[sourceTransitionsGr.getValue("to_state")]);
            transitions[sourceTransitionsGr.getUniqueValue()] = targetGr.insert();
        }
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_copyTransitions] target transitions: " + JSON.stringify(transitions));
        return transitions;
    },

    _copyTransitionConditions: function(mappedTransitions /** Array of transition condition objects to copy **/ ) {
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_copyTransitionConditions] conditions: " + JSON.stringify(mappedTransitions));
        var sourceConditionsGr = this._getTransitionConditionsGr(Object.keys(mappedTransitions));
        var conditionGr = new GlideRecord("sttrm_transition_condition");
        while (sourceConditionsGr.next()) {
            conditionGr.initialize();
            var targetTransition = mappedTransitions[sourceConditionsGr.getValue("sttrm_state_transition")];
            conditionGr.setValue("sttrm_state_transition", targetTransition);
            conditionGr.setValue("condition_type", sourceConditionsGr.getValue("condition_type"));
            conditionGr.setValue("condition_script", sourceConditionsGr.getValue("condition_script"));
            conditionGr.setValue("description", sourceConditionsGr.getValue("description"));
            conditionGr.setValue("condition", sourceConditionsGr.getValue("condition"));
            conditionGr.setValue("name", sourceConditionsGr.getValue("name"));
            conditionGr.setValue("order", sourceConditionsGr.getValue("order"));
            var targetTransitionConditionSysId = conditionGr.insert();

            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[_copyTransitionConditions] target transitionConditionSysId: " + targetTransitionConditionSysId);

            var isMandatoryFieldsConditionType = sourceConditionsGr.condition_type.getRefRecord().getValue("condition_type") === "mandatory_fields";

            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[_copyTransitionConditions] isMandatoryFieldsConditionType: " + isMandatoryFieldsConditionType);

            if (isMandatoryFieldsConditionType) {
                var sourceTransitionConditionSysId = sourceConditionsGr.getUniqueValue();
                var sourceTransitionConditionFieldGr = new GlideRecord("sttrm_transition_condition_field");
                sourceTransitionConditionFieldGr.addQuery("transition_condition", sourceTransitionConditionSysId);
                sourceTransitionConditionFieldGr.query();
                while (sourceTransitionConditionFieldGr.next()) {
                    var targetTransitionConditionFieldGr = new GlideRecord("sttrm_transition_condition_field");
                    targetTransitionConditionFieldGr.initialize();
                    targetTransitionConditionFieldGr.setValue("transition_condition", targetTransitionConditionSysId);
                    targetTransitionConditionFieldGr.setValue("name", sourceTransitionConditionFieldGr.getValue("name"));
                    targetTransitionConditionFieldGr.insert();
                }
            }
        }
    },

    _getAllStateTransitionsGr: function() {
        var gr = new GlideRecord("sttrm_state_transition");
        gr.addQuery("from_state.sttrm_model", this._gr.getUniqueValue());
        gr.query();
        return gr;
    },

    _getTransitionConditionsGr: function(transitionsSysIds /** Array of transitions sys_ids */ ) {
        var gr = new GlideRecord("sttrm_transition_condition");
        gr.addQuery("sttrm_state_transition", "IN", transitionsSysIds);
        gr.query();
        return gr;
    },

    _validProcessTable: function(processGr) {
        if (this._gr.getValue("table_name") === processGr.getTableName())
            return true;

        return false;
    },

    _isGlideRecord: function(inputVar) {
        return inputVar && typeof inputVar.getTableName === "function";
    },

    //Returns the SysChoices for the given table and field
    _getSysChoices: function() {
        var retVal = [];
        var choiceGr = new GlideSysChoice(
            this._gr.getValue("table_name"),
            this._gr.getValue("state_field")
        ).getChoices();

        while (choiceGr.next()) {
            if (choiceGr.getValue("inactive") === "1")
                continue;

            retVal.push({
                "value": choiceGr.getValue("value"),
                "label": choiceGr.getDisplayValue("label"),
                "sequence": choiceGr.getValue("sequence")
            });
        }
        return retVal;
    },

    type: "STTRMModelSNC"
};

// Choice Script for the state_field
// Returns a ChoiceList of field names which are Choice Lists on the table provided
STTRMModelSNC.getStateFieldChoices = function(tableName) {
    if (!tableName)
        return null;

    var processTableGr = new GlideRecord(tableName);
    if (!processTableGr.isValid())
        return null;

    processTableGr.initialize();

    var fields = processTableGr.getFields();
    var fieldChoices = new GlideChoiceList();
    for (var i = 0; i < fields.size(); i++) {
        var field = fields.get(i);
        if (field.getED().isChoiceTable())
            fieldChoices.add(field.getName() + "", field.getLabel() + " [" + field.getName() + "]");
    }

    return fieldChoices;
};

STTRMModelSNC.clearCache = function() {
    GlideCacheManager.flush(STTRMModelSNC.prototype.CACHE_NAME);
};
