var InteractionHelpRequestUtilSNC = Class.create();
InteractionHelpRequestUtilSNC.prototype = {
    initialize: function() {},

    /**
     * Checks whether the logged in user can access a supervisor help action.
     * Verifies if the user is the provider, or has access to the help request or associated interaction.
     * @param {GlideRecord} intSupervisorHelpGr - The supervisor help action record
     * @param {string} operation - The access operation (read/write)
     * @returns {boolean} True if user has access, false otherwise
     */
    canAccessSupervisorHelpAction: function(intSupervisorHelpGr, operation) {
        var canAccess = false;
        canAccess = this._matchLoggedInUser(intSupervisorHelpGr, InteractionHelpRequestConstants.FIELD_PROVIDED_BY);

        var helpRequestId = intSupervisorHelpGr.help_request;
        if (!canAccess && !gs.nil(helpRequestId)) {
            canAccess = this._canAccessRecord(helpRequestId,
                InteractionHelpRequestConstants.TABLE_INTERACTION_HELP_REQUEST, operation);
        }

        // If no access via help request, check if interaction is populated and can be accessed
        if (!canAccess) {
            var interactionId = intSupervisorHelpGr.interaction;
            if (!gs.nil(interactionId)) {
                canAccess = this._canAccessRecord(interactionId,
                    InteractionHelpRequestConstants.TABLE_INTERACTION, operation);
            }
        }
        return canAccess;
    },

    /**
     * Checks whether the logged in user has read/write access to an interaction help request.
     * Access is granted if the user is the requester, provider, or has access to the associated interaction.
     * @param {GlideRecord} intHelpRequestGr - The interaction help request record
     * @param {string} operation - The access operation (read/write)
     * @returns {boolean} True if user has access, false otherwise
     */
    canAccessInteractionHelpRequest: function(intHelpRequestGr, operation) {
        var canAccess = false;
        /*
         * Provide read/write access to agent requesting help and supervisor providing help
         */
        canAccess = this._matchLoggedInUser(intHelpRequestGr, InteractionHelpRequestConstants.FIELD_REQUESTED_BY) ||
            this._matchLoggedInUser(intHelpRequestGr, InteractionHelpRequestConstants.FIELD_PROVIDED_BY);

        /*
         * Check whether the user has read access to associated interaction
         */
        var interactionId = intHelpRequestGr.interaction;
        if (!canAccess && !gs.nil(interactionId))
            canAccess = this._canAccessRecord(interactionId, InteractionHelpRequestConstants.TABLE_INTERACTION, operation);
        return canAccess;
    },

    /**
     * Checks if the logged in user matches the user in the specified field.
     * @param {GlideRecord} intHelpRequestGr - The help request record
     * @param {string} _userField - The field name containing the user ID to match
     * @returns {boolean} True if the logged in user matches the field value, false otherwise
     * @private
     */
    _matchLoggedInUser: function(intHelpRequestGr, _userField) {
        var _userID = intHelpRequestGr.getValue(_userField);
        return !gs.nil(_userID) && (_userID === gs.getUserID());
    },

    /**
     * Checks if the current user can perform the specified operation on a record.
     * @param {string} recordId - The sys_id of the record to check
     * @param {string} tableName - The table name of the record
     * @param {string} operation - The access operation (read/write)
     * @returns {boolean} True if user can access the record, false otherwise
     * @private
     */
    _canAccessRecord: function(recordId, tableName, operation) {
        var recordGr = new GlideRecord(tableName);
        if (recordGr.get(recordId)) {
            if (operation === InteractionHelpRequestConstants.ACCESS_READ)
                return recordGr.canRead();
            if (operation === InteractionHelpRequestConstants.ACCESS_WRITE)
                return recordGr.canWrite();
        }
        return false;
    },

    /**
     * Retrieves all active help request reason codes.
     * @returns {Array} Array of reason code objects with sys_id and code values
     */
    getActiveReasons: function() {
        var gr = new GlideRecord(InteractionHelpRequestConstants.TABLE_INTERACTION_HELP_REQUEST_REASON);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            answer.add(gr.getValue(InteractionHelpRequestConstants.HELP_REQUEST_REASON_SYSID), gr.getValue(InteractionHelpRequestConstants.HELP_REQUEST_REASON_CODE));
        }
    },

    /**
     * Retrieves all active help requests associated with the given interaction.
     * @param {string} interactionId - The interaction sysId
     * @returns {GlideRecord} GlideRecord containing active help requests for the interaction
     * @private
     */
    _getActiveHelpRequests: function(interactionId) {
        var helpRequestGr = new GlideRecord(InteractionHelpRequestConstants.TABLE_INTERACTION_HELP_REQUEST);
        helpRequestGr.addActiveQuery();
        helpRequestGr.addQuery(InteractionHelpRequestConstants.HELP_REQUEST_FIELD_INTERACTION, interactionId);
        helpRequestGr.query();
        return helpRequestGr;
    },

	/**
     * Retrieves supervisor help actions associated with the given interaction.
     * @param {string} interactionId - The interaction sys_id
     * @returns {GlideRecord} GlideRecord containing supervisor help actions for the interaction
     * @private
     */
	_getAssociatedActiveSupervisorActions: function(interactionId){
		var supervisorHelpActionGr = new GlideRecord(InteractionHelpRequestConstants.TABLE_SUPERVISOR_HELP_ACTION);
        supervisorHelpActionGr.addQuery(InteractionHelpRequestConstants.SUPERVISOR_HELP_ACTION_FIELD_INTERACTION, interactionId);
		supervisorHelpActionGr.addNullQuery(InteractionHelpRequestConstants.SUPERVISOR_HELP_ACTION_FIELD_END_TIME);
		supervisorHelpActionGr.query();
		return supervisorHelpActionGr;
	},

    /**
     * Checks if the given interaction has any active help requests.
     * @param {string} interactionId - The interaction sysId
     * @returns {boolean} True if the interaction has active help requests, false otherwise
     */
	hasActiveHelpRequest: function(interactionId){
		return this._getActiveHelpRequests(interactionId).hasNext();
	},

	/**
     * Checks if the given interaction has any associated supervisor help actions.
     * @param {string} interactionId - The interaction sys_id
     * @returns {boolean} True if the interaction has associated supervisor help actions, false otherwise
     */
	hasAssociatedActiveSupervisorAction: function(interactionId){
		return this._getAssociatedActiveSupervisorActions(interactionId).hasNext();
	},

    /**
     * Cancels all active help requests associated with the given interaction.
     * @param {GlideRecord} interactionGr - The interaction record
     * @param {GlideRecord} prev_assigned_to - The previous assigned user (optional, only added if assigned to is changed)
     */
    cancelHelpRequest: function(interactionGr, prev_assigned_to = null) {
        var helpRequestGr = this._getActiveHelpRequests(interactionGr.getUniqueValue());
        while (helpRequestGr.next()) {
            if (!prev_assigned_to) {
                helpRequestGr.work_notes = gs.getMessage("Help Request {0} status is updated to Cancelled as related issue {1} was updated to {2}", [helpRequestGr.number, interactionGr.number, interactionGr.state.getDisplayValue()]);
				this._updateHelpRequest(interactionGr, helpRequestGr, InteractionHelpRequestConstants.HELP_REQUEST_CANCELLED);
            } else if (prev_assigned_to.toString() == helpRequestGr.requested_by.toString()) {
                helpRequestGr.work_notes = gs.getMessage("Help Request {0} status is updated to Cancelled as related issue {1} was assigned from {2} to {3}", [helpRequestGr.number, interactionGr.number, prev_assigned_to.getDisplayValue(), interactionGr.assigned_to.getDisplayValue()]);
				this._updateHelpRequest(interactionGr, helpRequestGr, InteractionHelpRequestConstants.HELP_REQUEST_CANCELLED);
            }

        }
    },

	/**
     * Closes any open supervisor help actions associated with the given interaction
     * by setting the end time to the current time if it's not already set.
     * 
     * @param {string} interactionId - The interaction sysId associated with the supervisor help actions
     * @returns {void}
     */
	closeSupervisorHelpAction: function(interactionId){
		if (gs.nil(interactionId))
            return;
		
		var supervisorHelpActionGr = this._getAssociatedActiveSupervisorActions(interactionId);

		while(supervisorHelpActionGr.next()){
			supervisorHelpActionGr[InteractionHelpRequestConstants.SUPERVISOR_HELP_ACTION_FIELD_END_TIME] = new GlideDateTime();
			supervisorHelpActionGr.update();
		}
	},

    /**
     * Updates a help request to a new state and adds work notes documenting the change.
     * @param {GlideRecord} interactionGr - The interaction record
     * @param {GlideRecord} helpRequestGr - The help request record to update
     * @param {string} newState - The new state value for the help request
     * @private
     */
    _updateHelpRequest: function(interactionGr, helpRequestGr, newState) {
        if (gs.nil(helpRequestGr) || gs.nil(interactionGr) || gs.nil(newState))
            return;
        helpRequestGr.state = newState;
        if (newState === InteractionHelpRequestConstants.HELP_REQUEST_CANCELLED) {
            helpRequestGr.cancelled_at = new GlideDateTime();
            helpRequestGr.cancelled_by = gs.getUserID();
        }
        helpRequestGr.update();
    },

	/**
     * Processes help request actions for both create and update operations from resolver environment.
     * Extracts required parameters from the resolver environment and formats them for the API call.
     * @param {ResolverEnvironment} env - The resolver environment containing arguments
     * @returns {Object} The parsed JSON result from the help request action API
     */
    processSupervisorHelpAction: function(env) {
        var supervisorHelpActionSysId = env.getArguments()['action_sys_id'] ? env.getArguments()['action_sys_id'] : "";
        var interaction = env.getArguments()['interaction'] ? env.getArguments()['interaction'] : "";
        var action = env.getArguments()['action'] ? env.getArguments()['action'] : "";
        var help_request = env.getArguments()['help_request'] ? env.getArguments()['help_request'] : "";
        var additionalMetadata = env.getArguments()['additional_metadata'] ? env.getArguments()['additional_metadata'] : "";
		
        var params = {
            interaction: interaction,
            action: action,
            help_request: help_request
        };

        if (additionalMetadata) {
            additionalMetadata = JSON.parse(additionalMetadata);
            if (Object.keys(additionalMetadata).length > 0)
                params.additionalMetadata = additionalMetadata;
        }

        var result = sn_interaction.HelpRequestAction.createOrUpdateHelpRequestAction(supervisorHelpActionSysId, params);
        return JSON.parse(result);
    },

    type: 'InteractionHelpRequestUtilSNC'
};
