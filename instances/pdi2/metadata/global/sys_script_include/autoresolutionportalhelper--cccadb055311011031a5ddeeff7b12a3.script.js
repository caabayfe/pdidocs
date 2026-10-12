var AutoResolutionPortalHelper = Class.create();

AutoResolutionPortalHelper.markRecommendationAsViewed = function(recommendationSysId) {
    var lineItem = new AutoResolutionAISearchResultLineItem(recommendationSysId);
    lineItem.setResultStatus("viewed");
    lineItem.update();
};

AutoResolutionPortalHelper.markRecommendationAsSubmitted = function(recommendationSysId, requestTable, requestId) {
    var lineItem = new AutoResolutionAISearchResultLineItem(recommendationSysId);
    if (lineItem.getResourceTable() === "kb_knowledge") {
        var logger = new AutoResolutionLoggingUtils().withName(this.type).createLogger();
        logger.error("AI Search Result line item {0} is a KB article recommendation. This recommendation cannot be marked as submitted.",
            recommendationSysId);
        return;
    }
	
    lineItem.setResultStatus("submitted");
    if (requestTable && requestId) {
        lineItem.setRequestTable(requestTable);
        lineItem.setRequestId(requestId);
    }
    lineItem.update();

    AutoResolutionAISearchHelper.updateResultLineItemFeedback(recommendationSysId, AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE, AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE, true);

    var aisResult = new AutoResolutionAISearchResult(lineItem.getAISearchResultId());
    var contextId = aisResult.getARContextId();

    new AutoResolutionContextHelper().handleCatalogSubmitted(contextId);
	
	// Set work notes on task indicating that the recommendation has been submitted
	var logger = new AutoResolutionLoggingUtils().withName(this.type).createLogger();
	var taskGr = aisResult.record.ar_context.task.getRefRecord();
	if (gs.nil(taskGr)) {
		logger.error("Unable to update work notes after the recommendation has been submitted because there is no task associated with the recommendation id: {0}", recommendationSysId);
		return;
	}
	
	if (gs.nil(lineItem.getRequestTable()) || gs.nil(lineItem.getRequestId())) {
		logger.error("Unable to update work notes after the recommendation has been submitted because there is no request table or id associated with the recommendation id {1}", recommendationSysId);
		return;
	}
	
	var requestGr = lineItem.record.request_id.getRefRecord();
	if (gs.nil(requestGr)) {
		logger.error("Unable to update work notes after the recommendation has been submitted because the request id {0} associated with the recommendation {1} is not valid", requestId, recommendationSysId);
		return;
	}

	var requestNumber = requestGr.getValue("number");
	if (gs.nil(requestNumber)) {
		logger.error("Unable to update work notes after the recommendation has been submitted because there is no request number associated with the request id: {0}", requestId);
		return;
	}

	new AutoResolutionTaskHelper().setWorkNotesOnTask(taskGr, 
		gs.getMessage("Catalog recommendation was submitted ({0})", requestNumber));
};

AutoResolutionPortalHelper.canUserViewRecommendations = function(taskGr) {
    if (gs.nil(taskGr))
        return false;

    var logger = new AutoResolutionLoggingUtils().withName(this.type).withTaskGr(taskGr).createLogger();

    var contextGr = new AutoResolutionContextHelper().getContextFromTask(taskGr);
    if (gs.nil(contextGr)) {
        logger.warn("Could not find valid context record for task {0}", taskGr.number);
        return false;
    }

    var configGr = contextGr.configuration.getRefRecord();
    if (!configGr) {
        logger.error("Task {0} does not have a corresponding Auto-Resolution configuration", taskGr.getUniqueValue());
        return false;
    }

    if (contextGr.task_resolved) {
        logger.info("Task {0} is resolved", taskGr.number);
        return false;
    }
	
    if (!(new AutoResolutionTaskHelper().isTaskAssignedToBotUser(taskGr))) {
        logger.info("Task {0} is not assigned to bot", taskGr.number);
        return false;
	}

    var notificationUserColumnInTaskTable = configGr.getValue("notification_user");
    if (gs.nil(notificationUserColumnInTaskTable)) {
        logger.error("Auto-Resolution configuration {0} does not have its notification user field configured",
            configGr.getUniqueValue());
        return false;
    }

    var notificationUser = taskGr.getValue(notificationUserColumnInTaskTable);
    if (gs.nil(notificationUser)) {
        logger.error("Task {0} does not have a notification user listed in the field {1}",
            taskGr.getUniqueValue(), notificationUserColumnInTaskTable);
        return false;
    }

    if (notificationUser !== gs.getUserID() && taskGr.getValue('assigned_to') !== gs.getUserID()) {
        logger.error("Notification user {0} does not match session user {1}", notificationUser, gs.getUserID());
        return false;
    }

    return true;
};

AutoResolutionPortalHelper.shouldShowRecommendationTab = function(taskGr) {
    if (gs.nil(taskGr))
        return false;

    if (taskGr.getValue("active") === "0") {
        logger.error("task {0} is not active", taskGr.number);
        return false;
    }

    var logger = new AutoResolutionLoggingUtils().withName(this.type).withTaskGr(taskGr).createLogger();

    var contextGr = new AutoResolutionContextHelper().getContextFromTask(taskGr);
    if (gs.nil(contextGr)) {
        logger.warn("Could not find valid context record for task {0}", taskGr.number);
        return false;
    }

    if (!AutoResolutionPortalHelper.canUserViewRecommendations(taskGr))
        return false;

    var aiSearchResult = AutoResolutionAISearchHelper.getSearchResultByContextId(contextGr.getUniqueValue());
    if (gs.nil(aiSearchResult)) {
        logger.warn("Waiting for AI Search results for task {0}", taskGr.number);
        return false;
    }

    if (aiSearchResult.getStatus() !== "success") {
        logger.error("AI search result failed for task {0}", taskGr.number);
        return false;
    }

    if (!aiSearchResult.getSearchResultSize()) {
        logger.error("No AI search result found for task {0}", taskGr.number);
        return false;
    }

    return true;
};

/**
 * Get the current SLA time left for a task
 * @param taskId
 * @returns {string|null}
 */
AutoResolutionPortalHelper.getSLATimeLeft = function(taskId) {
    if (gs.nil(taskId))
        return null;

    var slaGr = new GlideRecord(AutoResolutionConstants.TASK_SLA_TABLE_NAME);
    slaGr.addQuery("task", taskId);
    slaGr.addQuery("sla.flow", AutoResolutionConstants.IAR_SLA_FLOW);
    slaGr.query();
    var slaSysId = '';
    if (slaGr.next()) {
        slaSysId = slaGr.getUniqueValue();
        if (!slaGr.end_time.nil())
            SLACalculatorNG.calculateSLA(slaGr, /* skipUpdate */ false, slaGr.end_time);
        else
            SLACalculatorNG.calculateSLA(slaGr, /* skipUpdate */ false);
    }

    if (gs.nil(slaSysId))
        return null;

    slaGr.initialize();
    slaGr.get(slaSysId);
    return slaGr.getDisplayValue("time_left");
};

AutoResolutionPortalHelper.getTaskFromRecommendation = function(recommendationSysId) {
    var aiSearchResultId = new AutoResolutionAISearchResultLineItem(recommendationSysId).getAISearchResultId();
    var aiSearchResult = new AutoResolutionAISearchResult(aiSearchResultId);
    var contextId = aiSearchResult.getARContextId();
    var result = new AutoResolutionContextHelper().getContextDetails(contextId);
    if (result.taskTable && result.taskId)
        return {
            table: result.taskTable,
            id: result.taskId
        };
    return null;
};

AutoResolutionPortalHelper.getRecommendationDetails = function(recommendationSysId) {
    var recommendationObj = {};
    var aiSearchResultId = new AutoResolutionAISearchResultLineItem(recommendationSysId).getAISearchResultId();
    var aiSearchResultObj = new AutoResolutionAISearchResult(aiSearchResultId);
    var contextId = aiSearchResultObj.getARContextId();
    var taskGr = new AutoResolutionContextHelper().getTaskDetails(contextId);
    recommendationObj.canView = AutoResolutionPortalHelper.canUserViewRecommendations(taskGr);
    recommendationObj.isFeedbackSubmitted = gs.nil(aiSearchResultObj.getFeedbackType()) ? false : true;
    recommendationObj.task = taskGr;
    recommendationObj.isOptedOut = new AutoResolutionTaskHelper().isTaskAssignedToBotUser(taskGr) ? false : true;
    return recommendationObj;
};

AutoResolutionPortalHelper.checkStandardTicketConfig = function(table) {
	var gr = new GlideRecord("ticket_configuration");
	gr.get("table", table);
	return gr.isValidRecord();
};

AutoResolutionPortalHelper.prototype = {
    RESULT_LIMIT: 5, //TODO: check if there is a property for that. 
    taskGr: null,
    IAR_TASK_UPDATE_FLOW_NAME: "iar_task_update",

    initialize: function(taskGr) {
        this.taskGr = taskGr;
        this.LOGGER = new AutoResolutionLoggingUtils().withName(this.type).withTaskGr(this.taskGr).createLogger();
    },

    unassignTask: function() {
        var result = this._getContextRecordFromTask();
        if (result.status === "failure")
            return result;

        var contextGr = result.context;
        if (contextGr.getValue('notification_state') === 'waiting') {
            contextGr.setValue("notification_state", 'declined');
            contextGr.update();
        }
        var workNotes = gs.getMessage("{0} requested to un-assign the task.", gs.getUserName());
        // applying unresolved template, setting context inactive and then unassigning task
        return this._executeTemplateAsFlow(this.taskGr.getUniqueValue(), contextGr.getUniqueValue(), workNotes,
            "unresolved");
    },

    getRecommendationsForTask: function() {
        var result = this._getContextRecordFromTask();
        if (result.status === "failure")
            return result;

        var contextGr = result.context;

        if (contextGr.getValue('notification_state') === 'waiting') {
            contextGr.setValue('notification_state', 'accepted');
            contextGr.update();
        }

        var aiSearchResult = AutoResolutionAISearchHelper.getSearchResultByContextId(contextGr.getUniqueValue());
        if (gs.nil(aiSearchResult)) {
            this.LOGGER.error("No AI search result found for task {0}", this.taskGr.number);
            return {
                status: "failure",
                error: gs.getMessage("Could not find AI search result for task {0}", this.taskGr.number)
            };
        }

        var aiSearchResultLineItems = aiSearchResult.getSearchResults();
        aiSearchResultLineItems.splice(this.RESULT_LIMIT);

        var recommendations = [];
        var isCatalogSubmitted = false;
        var isFeedbackSubmitted = gs.nil(aiSearchResult.getFeedbackType()) ? false : true;

        for (var i = 0; i < aiSearchResultLineItems.length; i++) {

            var recommendationSysId = aiSearchResultLineItems[i].getSysId();
            var recommendationPayload = JSON.parse(aiSearchResultLineItems[i].getResultPayload());
            var resultStatus = aiSearchResultLineItems[i].getResultStatus();

            if (resultStatus === "submitted")
                isCatalogSubmitted = true;

            var feedbackType = aiSearchResultLineItems[i].getFeedbackType();
            var recommendation = {
                "id": recommendationSysId,
                "resultStatus": resultStatus,
                "title": GlideSPScriptable().stripHTML(recommendationPayload.propValues.title),
                "className": recommendationPayload.propValues.model.table,
                "description": GlideSPScriptable().stripHTML(recommendationPayload.propValues.description),
                "feedbackType": gs.nil(feedbackType)? "": feedbackType,
            };

            if (recommendationPayload.propValues.model.table == AutoResolutionConstants.CATALOG_TABLE_NAME)
                recommendation["category"] = recommendationPayload.propValues.context2;

            recommendation["url"] = AutoResolutionAISearchResultLineItem.getRecommendationURL(aiSearchResultLineItems[i]);
            recommendation["url"] = this._replaceReferrerURL(recommendation["url"]);
			
			// Use the catalog item or kb article record to get an image for the recommendation content
			var recommendationContentGr = new GlideRecord(recommendationPayload.propValues.model.table);
			recommendationContentGr.get(recommendationPayload.propValues.model.sys_id)
			recommendation["image"] = this._getRecommendedItemImage(recommendationContentGr);
			
            recommendations.push(recommendation);
        }

        return {
            status: "success",
            recommendations: recommendations,
            isCatalogSubmitted: isCatalogSubmitted,
            isFeedbackSubmitted: isFeedbackSubmitted
        };
    },

    submitFeedback: function(feedbackObject) {
        var result = this._getContextRecordFromTask();
        if (result.status === "failure")
            return result;
        var contextGr = result.context;

        var aiSearchResult = AutoResolutionAISearchHelper.getSearchResultByContextId(contextGr.getUniqueValue());
        if (gs.nil(aiSearchResult)) {
            this.LOGGER.error("Could not update feedback. No AI search result found for task {0}", this.taskGr.number);
            return {
                status: "failure",
                error: gs.getMessage("Could not submit feedback because there is no AI Search result for task {0}", this.taskGr.number)
            };
        }

        aiSearchResult.setFeedbackType(feedbackObject.aisHelpful);
        aiSearchResult.update();

        var feedbackValue = feedbackObject.aisHelpful === AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE
            ? feedbackObject.aisHelpful : "";
        AutoResolutionAISearchHelper.updateMultipleResultLineItemFeedbacks(feedbackObject.aisResultsList, 
            feedbackObject.aisHelpful, feedbackValue);

        if (!gs.nil(feedbackObject.additionalComment)) {
            this.taskGr.comments = feedbackObject.additionalComment;
            AutoResolutionTaskDataBroker.updateTaskRecord(this.taskGr);
        }

        if (feedbackObject.closeRequest == "close") {
            return this._executeTemplateAsFlow(this.taskGr.getValue('sys_id'), contextGr.getUniqueValue(),
                gs.getMessage("{0} requested to close the task after providing feedback.", gs.getUserName()), "resolved");
        } else if (feedbackObject.closeRequest == "open") {
            // Only unassign if task is assigned to BOT user. User cannot provide feedback if task is not assigned to BOT. 
            var isTaskAssignedToBotUser = new AutoResolutionTaskHelper().isTaskAssignedToBotUser(this.taskGr);
            if (isTaskAssignedToBotUser) {
                return this._executeTemplateAsFlow(this.taskGr.getValue('sys_id'), contextGr.getUniqueValue(),
                    gs.getMessage("{0} requested to keep the task open after providing feedback.", gs.getUserName()), "unresolved");
            }

            return {
                status: "failure",
                error: "Could not submit feedback because the task is not assigned to the bot user."
            };
        }
    },

    _getContextRecordFromTask: function() {
        var contextGr = new AutoResolutionContextHelper().getContextFromTask(this.taskGr);
        if (gs.nil(contextGr)) {
            this.LOGGER.warn("Could not find valid context record for task {0}", this.taskGr.number);
            return {
                status: "failure",
                error: gs.getMessage("Could not find valid context record for task {0}", this.taskGr.number)
            };
        }

        return {
            status: "success",
            context: contextGr
        };
    },

	_getRecommendedItemImage: function(recommendationContentGr) {
		if (!recommendationContentGr) {
			this.LOGGER.error('Recommendation content record does not exist');
			return null;
		}
		
		var imageFieldNameList = ["icon", "picture", "image", "mobile_picture"];
		
		for (var i = 0; i < imageFieldNameList.length; i += 1) {
			var imageFieldName = imageFieldNameList[i];
			if (!recommendationContentGr.isValidField(imageFieldName))
				continue;

			var imageSysId = recommendationContentGr.getValue(imageFieldName);
			if (imageSysId)
				return imageSysId + ".iix";
			
		}
		
		// If no image has been found, return a default image
		var defaultImageFileName;
		var tableName = recommendationContentGr.getTableName();
		
		// TODO: Replace both temporary default images after feedback and
		// third image if the recommended item is neither a catalog item or kb article
		if (tableName === global.AutoResolutionConstants.CATALOG_TABLE_NAME) {
			defaultImageFileName = gs.getProperty("glide.sg.image.default.sc_cat_item");
		} else if (tableName === global.AutoResolutionConstants.KNOWLEDGE_TABLE_NAME) {
			defaultImageFileName = gs.getProperty("glide.sg.image.default.kb_knowledge_base");
		}
		
		// Verify that image file exists in Images table
		var imageGr = new GlideRecord("db_image");
		imageGr.addQuery("name", defaultImageFileName);
		imageGr.query();
		
		if (!imageGr.next()) {
			this.LOGGER.error("Image with file name {0} does not exist", defaultImageFileName);
			return null;
		}
		
		return defaultImageFileName;
	},

    /**
     * For any end user driven updates to the task, use this method to execute IAR related templates as system user
     * using FDIH, because end user might not have permission to impersonate or make updates to all the task fields directly
     * @param taskSysId
     * @param contextSysId
     * @param workNotes
     * @param templateType
     * @returns {{status: "success"/"failure", error:""}}
     * @private
     */
    _executeTemplateAsFlow: function(taskSysId, contextSysId, workNotes, templateType) {
        var inputs = {};
        inputs['task_sys_id'] = taskSysId;
        inputs['context_sys_id'] = contextSysId;
        inputs['worknotes'] = workNotes;
        inputs['template_type'] = templateType;

        var scriptableFlowRunResult = sn_fd.FlowAPI.getRunner().subflow(this.IAR_TASK_UPDATE_FLOW_NAME).inBackground().withInputs(inputs).run();
        var contextID = gs.nil(scriptableFlowRunResult) ? null : scriptableFlowRunResult.getContextId();

        var result = {};
        if (gs.nil(contextID)) {
            result.status = "failure";
            result.error = gs.getMessage("Unexpected error during task update. Context ID returned by Flow API is null while executing IAR task update flow");
            return result;
        }
        this.LOGGER.debug("IAR Task Update subflow executed successfully with Context ID={0}", contextID);
        result.status = "success";
		result.flowContextId = contextID;
        return result;
    },

    /**
     * For a recommendation URL, replace "referrer=va" with "referrer=portal"
     * @param url
     * @returns {string}
     * @private
     */
    _replaceReferrerURL: function(url) {
        var referrerVARegEx = new RegExp("([?&]referrer=)va(&|$)");
        return url.replace(referrerVARegEx, "$1portal$2");
    },

    type: 'AutoResolutionPortalHelper'
};
