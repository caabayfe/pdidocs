var NextBestActionServiceImpl = Class.create();
NextBestActionServiceImpl.prototype = {
    initialize: function() {
        this._nextBestActionDAO = sn_nb_action.NextBestActionUtil.getNextBestActionDAO();
        this.ruleService = sn_nb_action.NextBestActionUtil.getRuleService();
        this.actionService = sn_nb_action.NextBestActionUtil.getActionService();
        this._consolidateActions = sn_nb_action.NextBestActionUtil.getConsolidateActions();
        this._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
        this.RAGlobalUtility = new global.RAGlobalUtility();
    },
    /*
     * Returns a JSON Object representing the existing context of the current record
     */
    getContext: function(currentRecord) {
        var contextRecord = this._nextBestActionDAO.getContext(currentRecord);
        if (contextRecord) {
            var context = {};
            context.number = contextRecord.getValue(sn_nb_action.Constants.COL_NUMBER);
            context.state = contextRecord.getValue(sn_nb_action.Constants.COL_STATE);
            return context;
        }
        return false;
    },
    /*
     * Creates or retrieves a context record and indicates if it’s new.
     */

    findOrCreateContext: function(currentRecord, ruleContextId, contextInputs) {
        var response = {
            contextRecord: null,
            isNewContext: false
        };

        var contextRecord = this._nextBestActionDAO.getContext(currentRecord, ruleContextId);
        if (!contextRecord ||
            contextRecord.getValue(sn_nb_action.Constants.COL_STATE) == sn_nb_action.Constants.STATE_CANCELLED ||
            contextRecord.getValue(sn_nb_action.Constants.COL_STATE) == sn_nb_action.Constants.STATE_COMPLETED) {
            contextRecord = this._nextBestActionDAO.createContext(currentRecord, ruleContextId);

            response.isNewContext = true;
            /**
                * This checks if the customer already have RA plugin installed and RAContext records exists before upgrade.
                * If yes, copies the recommendations from old RAContext to new RAContext.
                **/
            if (gs.nil(gs.getProperty('sn_nb_action.new_installation'))) {
                var oldContextRecord = this._nextBestActionDAO.getOldContext(currentRecord);
                if (oldContextRecord) {
                    this._nextBestActionDAO.copyOldActionsToNewContext(oldContextRecord, contextRecord);
                    response.isNewContext = false;
                }
            }
        }

        if (!contextRecord)
            return false;

        //persist the context inputs values
        var needsUpdate = false;
        contextInputs = gs.nil(contextInputs) ? {} : contextInputs;
        Object.keys(contextRecord.context_inputs).forEach(function(key) {
            if (key == "sys_meta" || key == "sys_id") {
                return;
            }
            var contextInputValue = contextRecord.context_inputs[key].getValue();
            if (key == Constants.COL_CONTEXT_TABLE && contextInputValue != contextRecord.document) {
                contextRecord.context_inputs[key] = contextRecord.document;
                needsUpdate = true;
            } else if (contextInputs.hasOwnProperty(key) && contextInputValue != contextInputs[key]) {
                contextRecord.context_inputs[key] = contextInputs[key];
                needsUpdate = true;
            }
        });
        if (needsUpdate)
            contextRecord.update();

        response.contextRecord = contextRecord;
        return response;
    },

    getFieldsToMonitor: function(currentRecordTable, ruleContext) {
        if (gs.nil(ruleContext))
            ruleContext = this._nextBestActionDAO.getRuleContext(currentRecordTable);
        var fieldsToMonitor = [];
        if (ruleContext) {
            var gr = this._nextBestActionDAO.getRulesFromContext(ruleContext);
            var seen = {};
            while (gr.next()) {
                var ruleRoles = gr.getValue(sn_nb_action.Constants.COL_ROLES);
                if (gs.nil(ruleRoles) || gs.hasRole(ruleRoles)) {
                    var fieldsEffectingThisRule = gr.getValue(sn_nb_action.Constants.COL_FIELD_AFF_RULE);
                    if (fieldsEffectingThisRule) {
                        var fieldNames = fieldsEffectingThisRule.split(",");
                        for (var index in fieldNames) {
                            if (!seen[fieldNames[index]]) {
                                seen[fieldNames[index]] = true;
                                fieldsToMonitor.push(fieldNames[index]);
                            }
                        }
                    }
                }
            }
        }
        return fieldsToMonitor;
    },

	/**
	 * Returns the array of excluded fields for a context record
	 * @param {GlideRecord} ruleContextRecord - Context record for the recommendations
	 * Also includes excluded fields of parent context record if exists for the context record and if inherit_exclusion_from_parent field is set for the context record
	 **/
	_getExcludedFields: function(ruleContextRecord) {
		var ruleContextTable = ruleContextRecord.getValue(sn_nb_action.Constants.COL_CONTEXT);
		var excludedFieldsList = [];
		var inheritParentExclusions = ruleContextRecord[sn_nb_action.Constants.COL_INHERIT_EXCLUSIONS_FROM_PARENT_CONTEXT];
		do {
			var currentContextExcludedFields = ruleContextRecord.getValue(sn_nb_action.Constants.COL_EXCLUDED_FIELDS);
			if (currentContextExcludedFields) {
				var currentContextExcludedFieldsList = currentContextExcludedFields.split(',');
				for(var excludedFieldIndex = 0; excludedFieldIndex < currentContextExcludedFieldsList.length; excludedFieldIndex++) {
					var excludedField = currentContextExcludedFieldsList[excludedFieldIndex];
					var isExtendedTableField = excludedField.split('.').length > 1 ? true : false;
					if(isExtendedTableField) {
						var excludedFieldSplit = excludedField.split('ref_'+ruleContextTable+'.');
						var isExtendedTableFieldOfCurrentContext = excludedFieldSplit.length > 1 ? true : false;
						if(isExtendedTableFieldOfCurrentContext) {
							excludedField = excludedFieldSplit[1];
							if(excludedFieldsList.indexOf(excludedField) == -1) {
								excludedFieldsList.push(excludedField);
							}
						}
					}
					else {
						if(excludedFieldsList.indexOf(excludedField) == -1){
							excludedFieldsList.push(excludedField);
						}
					}
				}
			}
			inheritParentExclusions = ruleContextRecord[sn_nb_action.Constants.COL_INHERIT_EXCLUSIONS_FROM_PARENT_CONTEXT];
			ruleContextRecord = ruleContextRecord[sn_nb_action.Constants.COL_MAP_PARENT_CONTEXT].getRefRecord();
		} while (ruleContextRecord.isValidRecord() && ruleContextRecord.active && inheritParentExclusions);
		return excludedFieldsList;
    },

	/**
	 * This determines async status to either emit an event or directly invoke recommendation generation.
	 * @param {String} currentRecordTable - Current record table name.
	 * @param {String} currentRecordSysId - Current record sys id.
	 * @param {String} recommendationType  - Recommendations needed for field level or side panel.
	 * @param {Boolean} forceRefresh - If true, forcefully generate recommendations
	 * @param {Object} fields - key value pair of unsaved changes for record fields
	 * @param {Boolean} groupRecommendations - If true, group recommendations based on the configuration per context
	 * @param {String} ruleContextId - Context record(sn_nb_action_rule_context) sys id
     * @param {Object} contextInputs - Additional inputs to the context to generate the recommendations
 
	 * 
	 **/
	getRecommendations: function(currentRecordTable, currentRecordSysId, recommendationType, forceRefresh, fields, groupRecommendations, ruleContextId, forceSyncRetry, contextInputs) {
		var ruleContext = this._nextBestActionDAO.getRuleContext(currentRecordTable, ruleContextId);
		if (!ruleContext)
			return false;

		var fieldsToMonitor = this.getFieldsToMonitor(currentRecordTable, ruleContext);
		var excludedFields = this._getExcludedFields(ruleContext);
		if (!sn_nb_action.NextBestActionUtil.isValidString(recommendationType)) {
			this._log.error("Invalid parameter - recommendationType");
			return false;
		}
		var isNewRecord = currentRecordSysId == '-1';

		var currentRecord = new GlideRecord(currentRecordTable);

		if (isNewRecord) {
			currentRecord.newRecord();
		} else {
			if (!currentRecord.get(currentRecordSysId)) {
				this._log.error("Invalid parameter - currentRecord");
				return false;
			}
		}
		var changedFields = fields ? Object.keys(fields) : [];
		var hasUnsavedChanges = isNewRecord || changedFields.length > 0;
		for (var i = 0; i < changedFields.length; i++)
			currentRecord.setValue(changedFields[i], fields[changedFields[i]]);

		if (!currentRecord.canRead()) {
			this._log.error("User doesn't have access to currentRecord");
			return false;
		}
		fields = isNewRecord ? [] : fields;
		var actionTypes = this._nextBestActionDAO.loadActionTypesByTable();
		if (!actionTypes) {
			this._log.error("There are no action types defined.");
			return false;
		}
		var contextDetails = this.RAGlobalUtility.findOrCreateContext(currentRecord, ruleContext.getUniqueValue(), contextInputs);
		if (!contextDetails) {
			this._log.error("Could not find or create context for " + currentRecord.getUniqueValue());
			return false;
		}
		var contextRecord = contextDetails.contextRecord;
		var isNewContext = contextDetails.isNewContext;
		var needsRegeneration = forceRefresh;
		if (!forceRefresh && contextRecord) {
			needsRegeneration = this._checkRecommendationStale(contextRecord, currentRecord, recommendationType);
		}

		var response = {};
		response.number = contextRecord.getValue(sn_nb_action.Constants.COL_NUMBER);
		response.actionDetails = [];
		response.contextId = contextRecord.getUniqueValue();
		response.contextState = contextRecord.getValue(sn_nb_action.Constants.COL_STATE);
		response.isAsync = ruleContext.getValue(sn_nb_action.Constants.COL_ASYNCHRONOUS_EVALUATION);
		response.fieldsToMonitor = fieldsToMonitor;
		response.excludedFields = excludedFields;
		forceSyncRetry = gs.nil(forceSyncRetry) ? false : forceSyncRetry;
		if (needsRegeneration && (response.isAsync === "1") && !forceSyncRetry && recommendationType == sn_nb_action.Constants.VAL_SIDE_PANEL_RECOMMENDATIONS) {
			var evaluationStatus = contextRecord.getValue(sn_nb_action.Constants.COL_EVALUATION_STATUS);
			if (evaluationStatus != sn_nb_action.Constants.EVALUATION_STATUS_WAITING) {
				this._nextBestActionDAO.setContextEvaluationStatus(contextRecord, Constants.EVALUATION_STATUS_WAITING, recommendationType);
				var inputs = {
					currentRecordTable: currentRecordTable,
					currentRecordSysId: currentRecordSysId,
					recommendationType: recommendationType,
					actionTypes: actionTypes,
					fields: fields,
					ruleContextId: ruleContext.getValue(sn_nb_action.Constants.COL_SYS_ID),
					needsRegeneration: needsRegeneration,
					hasUnsavedChanges: hasUnsavedChanges,
					isNewContext: isNewContext,
					groupRecommendations: groupRecommendations,
					response: response,
					userId: gs.getUserID(),
					asyncEventCreationTime: new GlideDateTime(),
					forceRefresh: forceRefresh
				};
				var defaultQueues = sn_nb_action.Constants.DEFAULT_QUEUES;
				var queues = gs.getProperty('sn_nb_action.ra_processor_number_of_queues', defaultQueues);
				if(queues < sn_nb_action.Constants.MIN_QUEUES || queues > sn_nb_action.Constants.MAX_QUEUES)
					queues = defaultQueues;
				var queueNumber = Math.floor(Math.random() * queues) + 1;
				var queueName = sn_nb_action.Constants.RECOMMENDATIONS_QUEUE_PREFIX + '_' + queueNumber;
				// Emitting event to generate recommendations.
				gs.eventQueue(sn_nb_action.Constants.RECOMMENDATION_REQUESTED_EVENT, null, JSON.stringify(inputs), contextRecord.getValue(sn_nb_action.Constants.COL_SYS_ID), queueName);
			}
		} else {
			var recommendationParams = {
				currentRecord: currentRecord,
				contextRecord: contextRecord,
				recommendationType: recommendationType,
				actionTypes: actionTypes,
				fields: fields,
				ruleContext: ruleContext,
				needsRegeneration: needsRegeneration,
				hasUnsavedChanges: hasUnsavedChanges,
				isNewContext: isNewContext,
				groupRecommendations: groupRecommendations,
				forceSyncRetry: forceSyncRetry,
				forceRefresh: forceRefresh
			};
			response = this.RAGlobalUtility.generateRecommendationsForUser(recommendationParams, response, '');
		}

		response.evaluationStatus = contextRecord.getValue(Constants.COL_EVALUATION_STATUS);
		if (response.isAsync === "1") {
			// will help show loader, even if page is refreshed and an existing generation process is ongoing. 
			// add checks before(seperate pr) to not fire the async event itself but still return "running" evalaution status in case the reevaluation is not needed and there is already ongiong process.
			// if async event was not fired and recommendations were fetched from DB, we return response with evalaution status completed to display results immediately.
			//for forceRetry scenario returning status as completed for UI to stop loader
			response.isAsync = forceSyncRetry ? "0" : "1";
			var asyncTimeOut = gs.nil(gs.getProperty(Constants.ASYNC_RA_TIMEOUT_PROPERTY)) ? 30 : gs.getProperty(Constants.ASYNC_RA_TIMEOUT_PROPERTY); //set default value 30
			asyncTimeOut = asyncTimeOut > 180 ? 180 : asyncTimeOut; // if the property value is greater than 180
			response.asyncTimeout = asyncTimeOut * 1000; //to convert seconds to millisecond
		}
		return response;
	},
	/**
	 * This will generate/refresh Recommended actions in sync fashion based on rules for the current record
	 * It takes recommendationParams and response as inputs, recommendationParams contains the following info {currentRecord,contextRecord,recommendationType,actionTypes,fields,ruleContext,needsRegeneration,hasUnsavedChanges,isNewContext,groupRecommendations}
	 * @param {Object} recommendationParams - contains the required info to generate recommendations.
	 * recommendationParams : {
	 * 	{GlideRecord} currentRecord - Current record
	 * 	{GlideRecord} contextRecord - context record for the recommendations
	 * 	{String} recommendationType  - Recommendations needed for field level or side panel.
	 * 	{Object} actionTypes - Data for all the supported action types.
	 * 	{Object} fields - key value pair of unsaved changes for record fields
	 * 	{String} ruleContext - Context record(sn_nb_action_rule_context)
	 * 	{Boolean} hasUnsavedChanges - Tells if there are any unsaved changes
	 * 	{Boolean} isNewContext - Tells if the context is newly created
	 * 	{Boolean} groupRecommendations - If true, group recommendations based on the configuration per context
	 * } 
	 * {Object} response - The response returned as part of generateRecommendations, has additional response values from the source. 
	 * 
	 **/
	generateRecommendations: function(recommendationParams, response, skipStaleCheck) {
		var currentRecord = recommendationParams.currentRecord;
		var contextRecord = recommendationParams.contextRecord;
		var recommendationType = recommendationParams.recommendationType;
		var actionTypes = recommendationParams.actionTypes;
		var fields = recommendationParams.fields;
		var ruleContext = recommendationParams.ruleContext;
		var needsRegeneration = recommendationParams.needsRegeneration;
		var hasUnsavedChanges = recommendationParams.hasUnsavedChanges;
		var isNewContext = recommendationParams.isNewContext;
		var groupRecommendations = recommendationParams.groupRecommendations;
		var forceSyncRetry = recommendationParams.forceSyncRetry;
		var forceRefresh = recommendationParams.forceRefresh;
		
		//To handle scenarios of Async and forceSyncRetry, where sync process has to wait for the async call to complete
		if (!forceRefresh && (gs.nil(skipStaleCheck) || !skipStaleCheck)) {
			needsRegeneration = this._checkRecommendationStale(contextRecord, currentRecord, recommendationType);
		}
		if (!response) {
			response = {};
		}
		var actionDetailsList = [];
		var existingActions = {};
		var actionsBeforeRegeneration = {};
		var result;
		if (needsRegeneration || hasUnsavedChanges) {
			if (needsRegeneration && !hasUnsavedChanges) {
				var actionsRecordsBeforeRegeneration = this._nextBestActionDAO.getAllActionDetails(contextRecord, false, recommendationType);
				if (actionsRecordsBeforeRegeneration)
					actionsBeforeRegeneration = this._getExistingActionsFromContext(actionsRecordsBeforeRegeneration);
				response.deleteCount = this._nextBestActionDAO.deleteRAByContext(contextRecord.getUniqueValue(), recommendationType);
			}
			var recommendationResult = this.ruleService.getBestActions(currentRecord, actionTypes, recommendationType, fields, ruleContext, contextRecord);
			var currentActions = recommendationResult.currentActions;
			var currentRules = recommendationResult.currentRules;
			if (isNewContext && currentActions) {
				actionDetailsList.newActionDetails = sn_nb_action.NextBestActionUtil.getObjectValues(currentActions);
			} else if (!(isNewContext && currentActions)) {
				var existingActionRecords = this._nextBestActionDAO.getAllActionDetails(contextRecord, false, recommendationType);
				if (existingActionRecords)
					existingActions = this._getExistingActionsFromContext(existingActionRecords);
				//Passing currentActions as empty object to consolidateActions to deactivate existing
				//actions if their corresponding rule is inactive in this run.
				if (!currentActions)
					currentActions = {};
				actionDetailsList = this._consolidateActions.consolidateActions(existingActions, currentActions, currentRules, hasUnsavedChanges);
			}
			if (needsRegeneration && !hasUnsavedChanges) {
				this._persistRecommendations(contextRecord, actionDetailsList, response, recommendationType, ruleContext);
				if (response.newActions && response.deleteCount && response.newActions > response.deleteCount) {
					response.newRARecommended = true;
				} else if (this._consolidateActions.checkNewRARecommended(actionsBeforeRegeneration, currentActions)) {
					response.newRARecommended = true;
				}
			}

		}
		if (hasUnsavedChanges)
			result = this.actionService.getActionsForUnsavedChanges(contextRecord, currentRecord, recommendationType, currentActions);
		else
			result = this.actionService.getActions(contextRecord, currentRecord, recommendationType, actionDetailsList);

		response.actionDetails = result.actionDetails;
		if (groupRecommendations) {
			if (ruleContext && sn_nb_action.NextBestActionUtil.isValidRecord(ruleContext)) {
				this.groupingService = sn_nb_action.NextBestActionUtil.getGroupingService(ruleContext);
				this.groupingService.initialize(ruleContext);
			}
		}
		if (groupRecommendations && !gs.nil(this.groupingService) && !gs.nil(this.groupingService.groupRecommendations) &&
			(typeof this.groupingService.groupRecommendations === "function")) {
			response.actionDetails = this.groupingService.groupRecommendations(result.actionDetails);
		}
		if (response.isAsync === "1") {
			// required to stop showing loader in UI
			if (contextRecord.getValue(Constants.COL_EVALUATION_STATUS) === Constants.EVALUATION_STATUS_CHOICES.WAITING) {
				response.evaluationStatus = Constants.EVALUATION_STATUS_CHOICES.WAITING;
			} else if (contextRecord.getValue(Constants.COL_EVALUATION_STATUS) === Constants.EVALUATION_STATUS_CHOICES.REFRESH_REQUESTED) {
	                        response.evaluationStatus = Constants.EVALUATION_STATUS_CHOICES.REFRESH_REQUESTED;
			} else {
				response.evaluationStatus = Constants.EVALUATION_STATUS_CHOICES.COMPLETED;
			}
			response.asyncTimeout = gs.getProperty(Constants.ASYNC_RA_TIMEOUT_PROPERTY) * 1000; //to convert seconds to millisecond
		}
		return response;
	},
    /*
     * Returns an array of JSON Object representing the completed or skipped actions for the current record
     * Returns empty list of actionDetails if no action or no context record is available
     */

    getRecommendationHistory: function(currentRecordSysId, currentRecordTable, ruleContextId) {

        var currentRecord = new GlideRecordSecure(currentRecordTable);

        if (!currentRecord.get(currentRecordSysId)) {
            this._log.error("Invalid parameter - currentRecord");
            return false;
        }

        if (!currentRecord.canRead()) {
            this._log.error("User doesn't have access to currentRecord");
            return false;
        }

        var ruleContext = this._nextBestActionDAO.getRuleContext(currentRecordTable, ruleContextId);
        var contextDetails = this.RAGlobalUtility.findOrCreateContext(currentRecord, ruleContext.getUniqueValue());
        if (!contextDetails) {
            this._log.error("Could not find or create context for " + currentRecord.getUniqueValue());
            return false;
        }
        var contextRecord = contextDetails.contextRecord;
        if (!contextRecord) {
            var result = {};
            result.actionDetails = [];
            return result;
        }
        var response = {};

        result = this.actionService.getCompletedAndSkippedActions(contextRecord, currentRecord);
        response.actionDetails = result.actionDetails;
        response.contextId = result.contextId;
        response.contextState = result.contextState;

        return response;

    },

    _persistRecommendations: function(contextRecord, actionDetailsList, response, recommendationType, ruleContextGr) {
        var newActionCount, updatedActionDetailCount = 0;
        var newActionOrderCount = 0;
        var updateActionOrderCount = 0;
        if (actionDetailsList) {
            if (actionDetailsList.newActionDetails) {
                newActionCount = this._nextBestActionDAO.addActionDetails(contextRecord, actionDetailsList.newActionDetails, ruleContextGr);
                if (newActionCount > 0)
                    response.newActions = newActionCount;
            }
            if (actionDetailsList.newActionDetailOrders) {
                newActionOrderCount = this._nextBestActionDAO.addActionDetailOrders(actionDetailsList.newActionDetailOrders);
                if (newActionOrderCount > 0)
                    response.newActionOrderCount = newActionOrderCount;
            }
            if (actionDetailsList.updateActionDetailOrders) {
                updateActionOrderCount = this._nextBestActionDAO.updateActionDetailOrders(actionDetailsList.updateActionDetailOrders);
                if (updateActionOrderCount > 0)
                    response.updateActionOrderCount = updateActionOrderCount;
            }
        }

        var currentState = contextRecord.getValue(sn_nb_action.Constants.COL_STATE);
        // now allow updating of refreshed time even if no recommendations generated.
        if (currentState == sn_nb_action.Constants.STATE_NEW && actionDetailsList) {
            this._nextBestActionDAO.setContextState(contextRecord, sn_nb_action.Constants.STATE_READY, true, recommendationType);
        } else if ((currentState == sn_nb_action.Constants.STATE_NEW || currentState == sn_nb_action.Constants.STATE_READY ||
                currentState == sn_nb_action.Constants.STATE_IN_USE)) {
            this._nextBestActionDAO.setContextState(contextRecord, currentState, true, recommendationType);
        }

    },

    _getExistingActionsFromContext: function(existingActionRecords) {
        var existingActions = {};
        if (gs.nil(existingActionRecords))
            return existingActions;
        while (existingActionRecords.next()) {
            if (!gs.nil(existingActionRecords[sn_nb_action.Constants.COL_RULE])) {
                var actionDetailId = this._nextBestActionDAO.removeRuleFromActionDetail(existingActionRecords);
                if (!actionDetailId)
                    this._log.error("Failed to remove rule for existing Action Detail Record " + existingActionRecords.getUniqueValue() + "for upgrade scenario");
            }
            var actionDetailOrders = this._nextBestActionDAO.getActionDetailOrders(existingActionRecords, true);
            var actDetailsObj = sn_nb_action.ActionDetail.createFromRecord(existingActionRecords, actionDetailOrders);
            if (Array.isArray(existingActions[actDetailsObj.getAction()]))
                existingActions[actDetailsObj.getAction()].push(actDetailsObj);
            else
                existingActions[actDetailsObj.getAction()] = [actDetailsObj];
        }
        return existingActions;
    },
    /*
     * @param {GlideRecord} currentRecord - Current record for which recommendations need to be fetched
     * @param {String} ruleContextId - Rule Context record sys_id (sn_nb_action_rule_context)
     * @param {Boolean} groupRecommendations - If true, group recommendations based on the configuration per context
     * @param {String} raContextId - Execution Context record sys_id (sn_nb_action_context)
     * {Object} response - The response returned as part of fetch Recommendations call
     */
    getActions: function(currentRecord, ruleContextId, groupRecommendations, raContextId) {
        var raContextRecord;
        if (gs.nil(raContextId)) {
            var contextDetails = this.findOrCreateContext(currentRecord, ruleContextId);
            if (!contextDetails) {
                this._log.error("Could not find or create context for " + currentRecord.getUniqueValue());
                return false;
            }
            raContextRecord = contextDetails.contextRecord;
        } else {
            raContextRecord = this._nextBestActionDAO.getContextFromSysId(raContextId);
            var currentUserId = gs.getUserID();
            if (currentUserId != raContextRecord.getValue(sn_nb_action.Constants.COL_USER)) {
                this._log.error("Current User with id=" + currentUserId + " does not have access to RA context id=" + raContextId);
                return false;
            }
        }
        if (!raContextRecord.isValidRecord())
            return false;
        var ruleContext = raContextRecord[sn_nb_action.Constants.COL_RULE_CONTEXT].getRefRecord();

        var result = this.actionService.getActions(raContextRecord, currentRecord, Constants.VAL_SIDE_PANEL_RECOMMENDATIONS);
        var response = {};
        var ruleContextGr = new GlideRecord(sn_nb_action.Constants.TBL_RULE_CONTEXT);
        ruleContextGr.get(ruleContextId);
        response.number = raContextRecord.getValue(sn_nb_action.Constants.COL_NUMBER);
        response.actionDetails = result.actionDetails;
        response.contextId = result.contextId;
        response.contextState = result.contextState;
        response.evaluationStatus = raContextRecord.getValue(Constants.COL_EVALUATION_STATUS);
        response.isAsync = ruleContext.getValue(sn_nb_action.Constants.COL_ASYNCHRONOUS_EVALUATION);
        response.excludedFields = this._getExcludedFields(ruleContextGr);

        if (groupRecommendations) {
            if (ruleContext && sn_nb_action.NextBestActionUtil.isValidRecord(ruleContext)) {
                this.groupingService = sn_nb_action.NextBestActionUtil.getGroupingService(ruleContext);
                this.groupingService.initialize(ruleContext);
                if (!gs.nil(this.groupingService) && !gs.nil(this.groupingService.groupRecommendations) &&
                    (typeof this.groupingService.groupRecommendations === "function")) {
                    response.actionDetails = this.groupingService.groupRecommendations(result.actionDetails);
                }
            }
        }
        return response;
    },


    //not being used anymore
    hasActiveOrderActions: function(contextRecord) {
        var getActionOrderRecord = this._nextBestActionDAO.getActionDetailOrdersFromContext(contextRecord, true, 1);
        if (getActionOrderRecord)
            return true;
        return false;
    },
    executeAction: function(currentRecord, actionDetailSysId, actionMetadata, actionInputs) {
        var executionDetail = this.useAction(currentRecord, actionDetailSysId);
        if (executionDetail.actionStatus == sn_nb_action.Constants.STATUS_ERROR) {
            return executionDetail;
        }
        if (executionDetail) {
            var contextRecord = this._nextBestActionDAO.getContextFromExecutionId(actionDetailSysId);
            if (!contextRecord)
                contextRecord = this._nextBestActionDAO.getContext(currentRecord);
            return this.actionService.executeAction(contextRecord, currentRecord, actionDetailSysId, actionMetadata, actionInputs);
        }
    },
    /*
     * This should be called whenever a recommended action is used.
     */
    useAction: function(currentRecord, actionDetailSysId, actionInputs) {
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(currentRecord) || !sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId)) {
            this._log.error("Invalid parameter");
            return false;
        }

        var contextRecord = this._nextBestActionDAO.getContextFromExecutionId(actionDetailSysId);
        if (!contextRecord) {
            this._log.error("Could not find context for RA Execution Id= " + actionDetailSysId);
            return false;
        }
        var actionAttributes = this.actionService.useAction(contextRecord, currentRecord, actionDetailSysId, actionInputs);

        if (actionAttributes) {
            if (actionAttributes.actionStatus == sn_nb_action.Constants.STATUS_ERROR) {
                return actionAttributes;
            }

            if (contextRecord.getValue(sn_nb_action.Constants.COL_STATE) == sn_nb_action.Constants.STATE_READY)
                this._nextBestActionDAO.setContextState(contextRecord, sn_nb_action.Constants.STATE_IN_USE);
            return actionAttributes;
        }
        return false;
    },
    dismissAction: function(currentRecord, actionDetailSysId) {
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(currentRecord) || !sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId)) {
            this._log.error("Invalid parameter");
            return false;
        }
        var contextRecord = this._nextBestActionDAO.getContextFromExecutionId(actionDetailSysId);
        if (!contextRecord) {
            this._log.error("Could not find context for RA Execution Id= " + actionDetailSysId);
            return false;
        }
        var dismissAction = this.actionService.dismissAction(contextRecord, currentRecord, actionDetailSysId);
        return dismissAction;
    },
    getActionDetail: function(currentRecord, actionDetailSysId) {
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(currentRecord) || !sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId)) {
            this._log.error("Invalid parameter");
            return false;
        }
        var contextRecord = this._nextBestActionDAO.getContextFromExecutionId(actionDetailSysId);
        if (!contextRecord) {
            this._log.error("Could not find context for RA Execution Id= " + actionDetailSysId);
            return false;
        }
        return this.actionService.getActionDetail(contextRecord, currentRecord, actionDetailSysId);
    },
    /*
     * Tells If the Recommendation can be acted upon.
     */
    isRecommendationAllowed: function(actionDetailSysId) {
        var actionDetailRecord = this._nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);
        if (actionDetailRecord) {
            return !this.actionService.hideRecommendation(actionDetailRecord);
        }
        return false;
    },

    /*
     * This should be called whenever a recommended action is ingored. Not being used currently.
     */
    ignoreAction: function(currentRecord, actionSysId) {
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(currentRecord) ||
            !sn_nb_action.NextBestActionUtil.isValidString(actionSysId)) {
            this._log.error("Invalid parameter");
            return false;
        }
        var contextRecord = this._nextBestActionDAO.getContext(currentRecord);
        if (!contextRecord) {
            this._log.error("Could not find context for " + [currentRecord, actionSysId]);
            return false;
        }
        return this.actionService.ignoreAction(contextRecord, actionSysId);
    },
    /*
     * This should be called whenever a recommended action in use is skipped.
     */
    actionSkipped: function(currentRecord, actionSysId, actionDetailSysId, actionTableName, actionInitialAttributes) {
        if (!gs.nil(actionDetailSysId)) {
            return this.actionService.skipAction('', '', actionDetailSysId);
        }
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(currentRecord) ||
            !sn_nb_action.NextBestActionUtil.isValidString(actionSysId)) {
            this._log.error("Invalid parameter");
            return false;
        }

        if (actionTableName && actionTableName == sn_nb_action.Constants.TBL_DECISION_TREE) {
            var contextRecords = this._nextBestActionDAO.getAllContexts(currentRecord);
            while (contextRecords.next()) {
                this.actionService.skipAction(contextRecords, actionSysId, '', actionInitialAttributes);
            }
            return true;
        }
        return false;
    },

    /*
     * This should be called whenever a recommended action is completed.
     */

    actionCompleted: function(currentRecord, actionSysId, actionDetailSysId, actionDetails, actionTableName, actionInitialAttributes) {
        if (!gs.nil(actionDetailSysId)) {
            // For Guidance and other potential action types in fuiture
            return this.actionService.completeAction('', '', actionDetailSysId, actionDetails);
        }
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(currentRecord) ||
            !sn_nb_action.NextBestActionUtil.isValidString(actionSysId)) {
            this._log.error("Invalid parameter");
            return false;
        }
        if (actionTableName && actionTableName == sn_nb_action.Constants.TBL_DECISION_TREE) {
            // will move a decision tree recommended across all RAExecution context(same/diff ruleContext) to completed state.
            var contextRecords = this._nextBestActionDAO.getAllContexts(currentRecord);
            while (contextRecords.next()) {
                this.actionService.completeAction(contextRecords, actionSysId, '', '', actionInitialAttributes);
            }
            return true;
        }
        return false;
    },

    actionProgressed: function(actionDetailSysId) {
        if (!gs.nil(actionDetailSysId)) {
            return this.actionService.progressAction(actionDetailSysId);
        }
    },

    _checkRecommendationStale: function(contextRecord, currentRecord, recommendationType) {
        if (contextRecord.getValue(sn_nb_action.Constants.COL_EVALUATION_STATUS) === sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.REFRESH_REQUESTED) {
            return true;
        }
        var lastRefreshTime;
        if (recommendationType == sn_nb_action.Constants.VAL_FIELD_RECOMMENDATIONS)
            lastRefreshTime = contextRecord.getValue(sn_nb_action.Constants.COL_REFRESHED_ON_FIELD_TYPE);
        else
            lastRefreshTime = contextRecord.getValue(sn_nb_action.Constants.COL_REFRESHED_ON);
        if (!lastRefreshTime)
            return true;

        if (this._checkRefreshIntervalExpired(contextRecord, lastRefreshTime))
            return true;
        return this._checkContextUpdated(contextRecord, currentRecord, lastRefreshTime);
    },

    /**
     * Checks if the refresh interval duration of context has passed and if regeneration is needed.
     */
    _checkRefreshIntervalExpired: function(contextRecord, lastRefreshTime) {
        var glideRefeshTime = new GlideDateTime(lastRefreshTime);
        var ruleContextRecord = this._nextBestActionDAO.getRuleContext(contextRecord.getValue(sn_nb_action.Constants.COL_CONTEXT_TABLE, contextRecord.getValue(sn_nb_action.Constants.COL_RULE_CONTEXT)));
        if (!ruleContextRecord)
            return false;
        var refreshInterval = ruleContextRecord[sn_nb_action.Constants.COL_REFRESH_INTERVAL].dateNumericValue();
        glideRefeshTime.add(refreshInterval);
        var currentTime = new GlideDateTime();
        if (glideRefeshTime.compareTo(currentTime) == 1)
            return false;
        return true;
    },

    /**
     * Checks if Current context updated time is later than RAContext refresh time. If yes,
     * regeneration is needed.
     */
    _checkContextUpdated: function(raContextRecord, currentRecord, raContextRefreshTime) {
        var glideRaContextRefreshTime = new GlideDateTime(raContextRefreshTime);
        var glideContextUpdateTime = new GlideDateTime(currentRecord.getValue(sn_nb_action.Constants.COL_SYS_UPDATED_ON));
        if (glideRaContextRefreshTime.compareTo(glideContextUpdateTime) == 1)
            return false;
        return true;
    },

    // Returns true if the rule is valid
    isValidRule: function(ruleRecord) {
        return this.ruleService.isValidRule(ruleRecord);
    },
    // Returns true if the action is allowed for table
    isActionAllowed: function(tableName, actionRecord) {
        if (!sn_nb_action.NextBestActionUtil.isValidString(tableName) ||
            !sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
            this._log.error("Invalid parameter");
            return false;
        }
        return this.actionService.isActionAllowed(tableName, actionRecord);
    },
    generateActions: function(currentRecord) {
        // This is just a dummy method, an unused flow triggers this method
    },

    /*
     * This should be called whenever a recommended action is errored.
     */
    actionErrored: function(currentRecord, actionSysId, actionDetailSysId, actionTableName, actionInitialAttributes) {
        if (!gs.nil(actionDetailSysId)) {
            return this.actionService.errorOutAction(currentRecord, actionSysId, actionDetailSysId);
        }
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(currentRecord) ||
            !sn_nb_action.NextBestActionUtil.isValidString(actionSysId)) {
            this._log.error("Invalid parameter");
            return false;
        }


        if (actionTableName && actionTableName == sn_nb_action.Constants.TBL_DECISION_TREE) {
            var contextRecords = this._nextBestActionDAO.getAllContexts(currentRecord);
            while (contextRecords.next()) {
                this.actionService.errorOutAction(contextRecords, actionSysId, '', actionInitialAttributes);
            }
            return true;
        }
        return false;
    },

    /**
     * This will generate search result actions using the ai search generator
     * @param {String} currentRecordTable - Current record table name.
     * @param {String} currentSysid - Current record sys id.
     * @param {String} searchTerm  - Based on this, search will be performed
     * @param {Object} filter - filter out the search results
     * @param {String} paginationToken  - Based on this, next set of search results will come up
     * @param {String} ruleContextId - Context record(sn_nb_action_rule_context) sys id
     * @param {Object} contextInputs - Context inputs for the search results
     **/
    getSearchResultActions: function(currentRecordTable, currentSysid, searchTerm, filter, paginationToken, selectedFacetFilters, selectedSortFilter, ruleContextId, contextInputs, shouldLogSignals) {
        var currentRecord = new GlideRecord(currentRecordTable);
        if (!currentRecord.get(currentSysid)) {
            this._log.error("Invalid parameter - currentRecord");
            return false;
        }
        if (!currentRecord.canRead()) {
            this._log.error("User doesn't have access to currentRecord");
            return false;
        }
        var ruleContext = this._nextBestActionDAO.getRuleContext(currentRecordTable, ruleContextId);
        if (!ruleContext) {
            this._log.error("Could not find rule context for " + currentRecordTable);
            return false;
        }
        var actionTypes = this._nextBestActionDAO.loadActionTypesByTable();
        if (!actionTypes) {
            this._log.error("There are no action types defined.");
            return false;
        }
        var contextDetails = this.RAGlobalUtility.findOrCreateContext(currentRecord, ruleContext.getUniqueValue(), contextInputs);
        if (!contextDetails) {
            this._log.error("Could not find or create context for " + currentRecord.getUniqueValue());
            return false;
        }
        var contextRecord = contextDetails.contextRecord;
        if (!searchTerm) {
            searchTerm = this.getDefaultSearchTermFromContext(currentRecordTable, currentSysid, ruleContext, contextInputs);
        }
        var response = {};
        var param = {};
        param[Constants.evaluatorVariable.CONTEXT_RECORD] = currentRecord;
        param[Constants.evaluatorVariable.SEARCH_TERM] = searchTerm;
        param[Constants.evaluatorVariable.SEARCH_FILTER] = filter;
        param[Constants.evaluatorVariable.RULE_CONTEXT] = ruleContext;
        param[Constants.evaluatorVariable.PAGINATION_TOKEN] = paginationToken;
        param[Constants.evaluatorVariable.FACET_FILTERS] = selectedFacetFilters;
        param[Constants.evaluatorVariable.SORT_FILTER] = selectedSortFilter;
        param[Constants.evaluatorVariable.SHOULD_LOG_SIGNAL] = shouldLogSignals;
        var aiSearchGeneratorTypeId = Constants.GENERATOR_TYPE_SYS_ID.AI_SEARCH;
        var handler = NextBestActionUtil.getGeneratorTypeHandler(aiSearchGeneratorTypeId);
        var output = [];
        var nextPaginationToken;
        do {
            if (handler && typeof handler.getOutputs === "function") {
                try {
                    output = handler.getOutputs(param);
                } catch (e) {
                    var errorMessage = e.message;
                    var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
                    logger.error('Error occurred while generating the outputs of resource generator type AI search' + '\n' +
                        'Context Record Table: ' + param[Constants.evaluatorVariable.CONTEXT_RECORD].sys_class_name + '\n' +
                        'Context Record SysId: ' + param[Constants.evaluatorVariable.CONTEXT_RECORD].sys_id + '\n' +
                        'Error Message : ' + errorMessage);
                    return false;
                }
            }
            var outputs = output && output.outputs || [];
            var result = {};
            result = this.actionService.fetchSearchActions(outputs, currentRecord, ruleContext, actionTypes);
            response.actionDetails = result.searchActionDetails;
            nextPaginationToken = output.paginationToken;
            param[Constants.evaluatorVariable.PAGINATION_TOKEN] = nextPaginationToken;
        }
        while (sn_nb_action.NextBestActionUtil.isValidString(nextPaginationToken) && (gs.nil(response.actionDetails) || response.actionDetails.length == 0));
        response.filters = output && output.filters || [];
        response.paginationToken = nextPaginationToken;
        response.contextId = contextRecord.getUniqueValue();
        response.contextState = contextRecord.getValue(sn_nb_action.Constants.COL_STATE);
        response.facetFilters = output && output.facetFilters || [];
        response.appliedFacetFiltersMetadata = output && output.appliedFacetFiltersMetadata || [];
        response.searchTerm = output.searchTerm;
        response.previousPaginationToken = output.previousPaginationToken;
        response.selectedFilter = filter;
        response.searchResultLimit = output && output.searchResultLimit || 0;
        response.applicableSortOptions = output && output.applicableSortOptions || [];
        response.refinedSearchAnalyticsPayload = output && output.refinedSearchAnalyticsPayload || {};
        return response;
    },
    getDefaultSearchTermFromContext: function(currTableName, currSysId, ruleContextRecord, contextInputs) {

        var defaultSearchTerm = '';
        if (ruleContextRecord) {
            defaultSearchTerm = ruleContextRecord.getValue(sn_nb_action.Constants.DEFAULT_SEARCH_FIELD);
        } else {
            ruleContextRecord = this._nextBestActionDAO.getRuleContext(currTableName);
            if (ruleContextRecord) {
                defaultSearchTerm = ruleContextRecord.getValue(sn_nb_action.Constants.DEFAULT_SEARCH_FIELD);
            }
        }
        if (defaultSearchTerm) {
            var currentRec = new GlideRecord(currTableName);
            currentRec.get(currSysId);
            var contextDetails = this.RAGlobalUtility.findOrCreateContext(currentRec, ruleContextRecord.getUniqueValue(), contextInputs);
            if (!contextDetails) {
                this._log.error("Could not find or create context for " + currentRec.getUniqueValue());
                return '';
            }
            var contextInputsObject = this._nextBestActionDAO.getContextInputsObject(currentRec, ruleContextRecord.getUniqueValue());
            var outputsObj = {
                contextInputs: contextInputsObject,
            };
            var inputPillParser = new sn_nb_action.NBAActionInputPillParser();
            defaultSearchTerm = inputPillParser.getParsedInputValue(defaultSearchTerm, outputsObj, currentRec);
            defaultSearchTerm = defaultSearchTerm ? sn_nb_action.NextBestActionUtil.getParsedStringValue(defaultSearchTerm) : '';
        } else {
            defaultSearchTerm = '';
        }
        return defaultSearchTerm;
    },

    getDefaultSearchTermSearchActions: function(currentRecordTable, currentSysId, ruleContextId, currentDefaultSearchTerm, filter, selectedFacetFilters, selectedSortFilter, includeSearchResults, contextInputs, shouldLogSignals) {
        var ruleContextRecord = this._nextBestActionDAO.getRuleContext(currentRecordTable, ruleContextId);
        if (!ruleContextRecord) {
            this._log.error("Could not find rule context for " + currentRecordTable);
            return false;
        }
        var excludedFields = this._getExcludedFields(ruleContextRecord);
        var defaultSearchTerm = this.getDefaultSearchTermFromContext(currentRecordTable, currentSysId, ruleContextRecord, contextInputs);
        var response = {};
        if (includeSearchResults && defaultSearchTerm && defaultSearchTerm.trim()) {
            var paginationToken = '';
            if (defaultSearchTerm.trim() != (currentDefaultSearchTerm ? currentDefaultSearchTerm.trim() : '')) {
                filter = [];
                selectedFacetFilters = [];
                selectedSortFilter = [];
            }
            response = this.getSearchResultActions(currentRecordTable, currentSysId, defaultSearchTerm, filter, paginationToken, selectedFacetFilters, selectedSortFilter, ruleContextId, contextInputs, shouldLogSignals);
        } else {
            response = this._getSearchFiltersWithCount(defaultSearchTerm, ruleContextRecord, shouldLogSignals);
        }

        response.defaultSearchTerm = defaultSearchTerm;
        response.excludedFields = excludedFields;
        return response;
    },

    _getSearchFiltersWithCount: function(searchTerm, ruleContextRecord, shouldLogSignals) {
        var response = {};
        var param = {};
        param[Constants.evaluatorVariable.SEARCH_TERM] = searchTerm;
        param[Constants.evaluatorVariable.RULE_CONTEXT] = ruleContextRecord;
        param[Constants.evaluatorVariable.SHOULD_LOG_SIGNAL] = shouldLogSignals;
        var aisHandler = new sn_nb_action.AISearchGeneratorTypeHandler();
        var output = aisHandler.getSearchFiltersWithCount(param);
        response.filters = output && output.filters || [];
        response.applicableSortOptions = output && output.applicableSortOptions || [];
        response.refinedSearchAnalyticsPayload = output && output.refinedSearchAnalyticsPayload || {};
        return response;
    },

    // method not in use anymore
    getSearchConfig: function(currentRecordTable) {
        var ruleContext = this._nextBestActionDAO.getRuleContext(currentRecordTable);
        var searchConfigId = ruleContext.search_application_configuration;
        return {
            searchConfigId: searchConfigId
        };
    },

    //Create Recommended Actions Execution Record for Search Card Execution
    createSearchExecutionRecord: function(currentRecordTable, currentRecordSysId, actionType, actionInputs, actionId, ruleContextId) {
        var currentRecord = this._nextBestActionDAO.getTableRecordBySysId(currentRecordTable, currentRecordSysId);
        var ruleContext = this._nextBestActionDAO.getRuleContext(currentRecordTable, ruleContextId);
        var contextDetails = this.RAGlobalUtility.findOrCreateContext(currentRecord, ruleContext.getUniqueValue());
        var contextRecord = contextDetails.contextRecord;
        var actionDetailRecordId = this._nextBestActionDAO.addSearchExecutionRecord(contextRecord, actionType, actionInputs, actionId, ruleContext);
        return actionDetailRecordId;
    },

    /*
     * Checks if a recommended action execution exists for an action for the given context.
     */
    isRecommendedActionExecution: function(currentRecord, actionSysId, attributes) {
        return this._nextBestActionDAO.checkActionDetailFromExecution(currentRecord, actionSysId, attributes);
    },

    /*
     * Returns the attributes from recommended action execution for the given recommended action and context.
     */
    fetchRAExecutionAttributes: function(currentRecord, actionRecord) {
        return this._nextBestActionDAO.getAttributesFromActionRecord(currentRecord, actionRecord);
    },

    /**
     * Forces a refresh of recommendations for the given rule context IDs and current record.
     *
     * This method fetches the relevant context records and marks them for recommendation
     * refresh by updating their evaluation status to 'refresh_requested'.
     *
     * @param {Array<String>} ruleContextSysIds - An array of sys_ids of the rule contexts.
     * @param {String} currentRecordSysId - The sys_id of the current record.
     * @param {Boolean} refreshAllUsers - Flag indicating whether to refresh recommendations for all users.
     *
     * @returns {Object} - Contains details on the outcome of the refresh request:
     *                     - {Boolean} status - True if successful; false otherwise.
     *                     - {Number} refreshedContextCount - Number of context records updated for refresh (only if successful).
     *                     - {String} errorMessage - Error message if the operation failed.
     */
    forceRefreshRecommendations: function(ruleContextSysIds, currentRecordSysId, refreshAllUsers) {
        if (gs.nil(ruleContextSysIds) || !Array.isArray(ruleContextSysIds) || ruleContextSysIds.length == 0) {
            this._log.error("Invalid parameter - ruleContextSysIds");
            return { status: false, errorMessage: "Invalid parameter - ruleContextSysIds" };
        }
        if (gs.nil(currentRecordSysId)) {
            this._log.error("Invalid parameter - currentRecordSysId");
            return { status: false, errorMessage: "Invalid parameter - currentRecordSysId" };
        }

        var refreshedContextCount = 0;
        var contextRecord = this._nextBestActionDAO.getContextsForForceRefresh(ruleContextSysIds, currentRecordSysId, refreshAllUsers);
        while (contextRecord.next()) {
            this._nextBestActionDAO.setContextEvaluationStatus(contextRecord, Constants.EVALUATION_STATUS_CHOICES.REFRESH_REQUESTED, Constants.VAL_SIDE_PANEL_RECOMMENDATIONS);
            refreshedContextCount++;
        }

        return { status: true, refreshedContextCount: refreshedContextCount };
    },
    
    /* Calling GlideSignalService API to log search analytics records. */
    addSearchSignal: function(eventName, eventType, searchAnalyticsPayload) {
        var signalsService = new GlideSignalsService();
        signalsService.trackEventAsync(eventName, eventType, searchAnalyticsPayload);
    },

    type: 'NextBestActionServiceImpl'
};
