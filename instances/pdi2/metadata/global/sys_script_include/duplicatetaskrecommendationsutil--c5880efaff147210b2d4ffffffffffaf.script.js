var DuplicateTaskRecommendationsUtil = Class.create();
DuplicateTaskRecommendationsUtil.prototype = {
    // Tables
    NOW_ASSIST_SKILL_CONFIG: 'sn_nowassist_skill_config',
    SYS_PROPERTIES: 'sys_properties',

    //Fields
    INTERNAL_NAME: 'internal_name',
    SKILL_ID: 'skill_id',
    NAME_FIELD: 'name',
    VALUE_FIELD: 'value',
    SYSTEM_FIELDS: ['sys_updated_on', 'sys_created_on', 'sys_class_name', 'sys_id'],

    // Roles
    CMDB_DEDUP_ADMIN_ROLE: 'cmdb_dedup_admin',

    CMDB_ASSIST_PLUGIN_ID: 'com.snc.cmdb.gen.ai',
    DUPLICATE_TASK_OPTIONS_RECOMMENDATION_CAPABILITY_ID: 'b60b906bffb032109937ffffffffff34',
    DUPLICATE_TASK_OPTIONS_RECOMMENDATION_SKILL_CONFIG_ID: '2b0b546bffb032109937ffffffffff8b',
    APP_NAME: "ServiceNow Otto for Configuration Management Database (CMDB)",
    DUPLICATE_TASK_OPTIONS_RECOMMENDATION_ERROR: "DuplicateTaskOptionsRecommendationsError",

    // Status Codes
    SUCCESS: 'success',
    ERROR: 'error',
    NOT_SUPPORTED: 'not_supported',
    COMPLETED: 'completed',
    TRUNCATION_FAILED: 'truncation_failed',

    // Properties
    DUPLICATE_REMEDIATOR_MAX_CIS_PROPERTY: 'glide.duplicate_ci_remediator.max.cis',
    DUPLICATE_REMEDIATOR_DRY_RUN_PROPERTY: 'glide.duplicate_ci_remediator.dry_run',
    TEMPLATE_REVIEW_BATCH_SIZE_PROPERTY: 'glide.duplicate_ci_remediator.ai.template_review_batch_size',
    RECOMMENDATION_TASK_BATCH_SIZE_PROPERTY: 'glide.duplicate_ci_remediator.ai.recommendation_task_batch_size',

    initialize: function() {
        this.DUPLICATE_REMEDIATOR_MAX_CIS = parseInt(gs.getProperty(this.DUPLICATE_REMEDIATOR_MAX_CIS_PROPERTY, 1000));
    },

    isSkillActive: function() {
        var skillInternalName = this._getSkillInternalName();
        if (!skillInternalName) {
            gs.error("Cannot find internal name for capability " + this.DUPLICATE_TASK_OPTIONS_RECOMMENDATION_CAPABILITY_ID);
            return false;
        }

        var configUtil = new sn_nowassist_admin.NowAssistSkillConfig();
        return GlidePluginManager.isActive(this.CMDB_ASSIST_PLUGIN_ID) && configUtil.isSkillConfigurationActive(this.DUPLICATE_TASK_OPTIONS_RECOMMENDATION_SKILL_CONFIG_ID) && gs.hasRightsTo("gen_ai_skill/" + skillInternalName + "/execute");
    },

    getDuplicateTaskRecommendations: function(taskId, taskRunId) {
        // Ensure taskRunId is a string (handle case where it might be an array from URL parsing)
        taskRunId = Array.isArray(taskRunId) ? taskRunId[0] : taskRunId;
        
        var startTime = new GlideTime();
        gs.debug("Begin getting recommendations for de-duplication task: " + taskId);
        var result = {};

        // Get duplicate task data and include it in the final output
        var taskData = sn_cmdb.DuplicateTemplate.getDuplicateTaskData(taskId);
        if (!taskData || Object.keys(taskData).length === 0) {
            result.status = this.ERROR;
            result.message = "Failed to get de-duplication task details.";
            return result;
        }
        result.taskData = taskData;
        gs.debug("Completed getting data for de-duplication task: " + taskId);

        // AI is not supported for some use cases
        if (taskData.isLarge || taskData.isDryRun || taskData.isInProgress || !taskData.isCmdbCi) {
            result.status = this.NOT_SUPPORTED;
            result.message = this._getNotSupportedMessage(taskData);
            return result;
        }

        // If taskRunId is provided, fetch recommendations from DB instead of calling AI skill
        if (!gs.nil(taskRunId)) {
            return this._getRecommendationsFromDB(taskId, taskRunId, result);
        }

        // Create and execute the capability request (single call)
        var duplicateTaskRecommendations = this._createAndExecuteCapability(taskData);

        if (gs.nil(duplicateTaskRecommendations)) {
            result.status = this.ERROR;
            result.message = "Something went wrong when executing AI skill. See logs for more details";
            return result;
        }

        // Check for truncation failure
        if (duplicateTaskRecommendations.status === this.TRUNCATION_FAILED) {
            result.status = this.TRUNCATION_FAILED;
            result.message = "Using AI is not supported for this de-duplication task. " +
                duplicateTaskRecommendations.error_message;
            return result;
        }

        result.duplicateTaskRecommendations = duplicateTaskRecommendations;
        result.status = this.SUCCESS;

        var endTime = new GlideTime();
        var totalTime = endTime.getNumericValue() - startTime.getNumericValue();
        gs.debug("Completed getting recommendations for de-duplication task: " + taskId + " in " + totalTime + " ms");

        return result;
    },

    _getRecommendationsFromDB: function(taskId, taskRunId, result) {
        gs.debug("Fetching AI recommendations from DB for task run: " + taskRunId);
        var gr = new GlideRecord('reconcile_duplicate_template_task_run');
        if (!gr.get(taskRunId)) {
            result.status = this.ERROR;
            result.message = "Task run not found: " + taskRunId;
            return result;
        }

        if (gr.getValue('task') !== taskId) {
            result.status = this.ERROR;
            result.message = "Task run does not belong to task: " + taskId;
            return result;
        }

        var recommendationsJson = gr.getValue('ai_recommendations');
        if (gs.nil(recommendationsJson)) {
            result.status = this.ERROR;
            result.message = "No AI recommendations found for task run: " + taskRunId;
            return result;
        }

        try {
            result.duplicateTaskRecommendations = JSON.parse(recommendationsJson);
        } catch (e) {
            result.status = this.ERROR;
            result.message = "Failed to parse AI recommendations for task run: " + taskRunId;
            return result;
        }

        result.status = this.SUCCESS;
        gs.debug("Successfully fetched AI recommendations from DB for task run: " + taskRunId);
        return result;
    },

    updateDuplicateTaskRecommendations: function(taskRunId, recommendations) {
        var result = {};
        gs.debug("Begin updating AI recommendations for task run: " + taskRunId);

        var gr = new GlideRecord('reconcile_duplicate_template_task_run');
        if (!gr.get(taskRunId)) {
            result.status = this.ERROR;
            result.message = "Task run not found: " + taskRunId;
            return result;
        }

        if (gr.getValue('state') !== 'recommendation_generated') {
            result.status = this.ERROR;
            result.message = "Task run is not in recommendation_generated state: " + taskRunId;
            return result;
        }

        if (gs.nil(recommendations)) {
            result.status = this.ERROR;
            result.message = "No recommendations provided for task run: " + taskRunId;
            return result;
        }

        gr.setValue('ai_recommendations', JSON.stringify(recommendations));
        if (gs.nil(gr.update())) {
            result.status = this.ERROR;
            result.message = "Failed to update AI recommendations for task run: " + taskRunId;
            return result;
        }

        result.status = this.SUCCESS;
        gs.debug("Successfully updated AI recommendations for task run: " + taskRunId);
        return result;
    },

    _createAndExecuteCapability: function(taskData) {
        // Build CI data with conflict detection
        var ciData = this._getCIData(taskData);

        // Get highest common class for priority attributes
        var classNames = Object.keys(taskData.taskItems);
        var highestCommonClass = this._getHighestCommonClass(classNames);

        // Create capability request
        var capabilityRequest = this._createCapabilityRequest(ciData, highestCommonClass);

        // Submit request
        var capabilityPayload = this._submitCapabilityRequest(capabilityRequest);

        if (!capabilityPayload) {
            return null;
        }

        // Check if it's a truncation failure
        if (capabilityPayload.status === this.TRUNCATION_FAILED) {
            gs.warn("Truncation failed for task: " + taskData.taskId);
            return {
                status: this.TRUNCATION_FAILED,
                error_message: capabilityPayload.errorMessage
            };
        }

        // Parse and return response
        return this._parseCapabilityResponse(capabilityPayload);
    },

    _createCapabilityRequest: function(ciData, highestCommonClass) {
        return {
            "definitionFilters": {},
            "payload": {
                "ci_data": ciData,
                "caller": this.APP_NAME,
                "highest_common_class": highestCommonClass
            },
            "capabilityId": this.DUPLICATE_TASK_OPTIONS_RECOMMENDATION_CAPABILITY_ID,
        };
    },

    _parseCapabilityResponse: function(capabilityPayload) {
        // Parse and validate the capability response
        var capabilityPayloadStatus = capabilityPayload.status;
        var requestLogId = capabilityPayload.logId;
        var capabilityId = capabilityPayload.capabilityId;
        var capabilityResponse = capabilityPayload.response;

        if (capabilityPayloadStatus !== this.SUCCESS) {
            gs.error(
                "Payload for capability '{0}' has status '{1}' " +
                "see sys_generative_ai_log with ID '{2}' for more info",
                [capabilityId, capabilityPayloadStatus, requestLogId]
            );
            return null;
        }

        if (gs.nil(capabilityResponse)) {
            gs.error(
                "No response for capability '{0}' " +
                "see sys_generative_ai_log with ID '{1}' for more info",
                [capabilityId, requestLogId]
            );
            return null;
        }

        var modelOutput = sn_cmdb_gen_ai.CMDBGenAIUtil.getModelOutput(capabilityResponse);

        if (gs.nil(modelOutput)) {
            gs.error("No or empty 'model_output' for the duplicate task options recommendation capability response");
            return null;
        }

        try {
            return this._parseResponse(modelOutput);
        } catch (e) {
            gs.error(
                "Failed to parse payload for capability '{0}' " +
                "see 'sys_generative_ai_log' with ID '{1}' for more info",
                [capabilityId, requestLogId]
            );
            return null;
        }
    },

    _submitCapabilityRequest: function(capabilityRequest) {
        var capabilityId = capabilityRequest.capabilityId;

        var oneExtendResponse;

        try {
            oneExtendResponse = sn_one_extend.OneExtendUtil.execute({
                executionRequests: [capabilityRequest]
            });
        } catch (error) {
            // Check if it's a truncation error
            if (error.name === this.DUPLICATE_TASK_OPTIONS_RECOMMENDATION_ERROR ||
                (error.message && error.message.indexOf("Configuration Items are too large") !== -1)) {
                gs.warn("Cannot get duplicate task options recommendations using AI skill due to size constraints: " + error.message);

                // Return a special payload indicating truncation failure
                return {
                    status: this.TRUNCATION_FAILED,
                    errorMessage: error.message
                };
            }

            // Other errors
            gs.error("Failed to submit request for capability '{0}' - {1}", [capabilityId, error.message]);
            return null;
        }

        var oneExtendResponseStatus = oneExtendResponse.status;
        if (oneExtendResponseStatus !== this.COMPLETED) {
            gs.error("Request for capability '{0}' has status '{1}'", [capabilityId, oneExtendResponseStatus]);
            return null;
        }

        var capabilityPayload = oneExtendResponse.capabilities[capabilityId];
        if (gs.nil(capabilityPayload) || Object.keys(capabilityPayload).length === 0) {
            gs.error("Empty payload for capability '{0}'", [capabilityId]);
            return null;
        }

        return capabilityPayload;
    },

    _parseResponse: function(response) {
        if (gs.nil(response) || (typeof response === 'object' && !Array.isArray(response) && Object.keys(response).length === 0)) {
            return null;
        }

        if (typeof response === 'object') return response;

        // Try to clean wrapped Markdown-style JSON strings for Azure provider
        if (typeof response === 'string') {
            var cleaned = response.trim();

            // Remove ```json or ``` and matching closing ```
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(json)?\n?/i, ''); // remove starting ```
                cleaned = cleaned.replace(/\n?```$/, ''); // remove ending ```
            }

            try {
                return JSON.parse(cleaned);
            } catch (e) {
                gs.error("Failed to parse response as JSON: " + e.message);
                return cleaned;
            }
        }
        gs.warn("Unexpected response type: " + typeof response);
        return null; // fallback for unexpected types
    },

    _getCIData: function(data) {
        var relatedItemCountsObj = data.relatedItemCounts || {};
        var relationshipCountsObj = data.relationshipCounts || {};
        var attributes = data.attributes;

        // Detect conflicting attributes across all CIs
        var conflictingAttributes = this._detectConflictingAttributes(attributes);

        // Build CI lines with only conflicting attributes
        var ciLines = [];
        for (var i = 0; i < attributes.length; i++) {
            var line = this._buildCILine(attributes[i], relatedItemCountsObj, relationshipCountsObj, conflictingAttributes);
            if (line) {
                ciLines.push(line);
            }
        }

        var ciData = ciLines.length > 0 ? ciLines.join("\n---\n") + "\n---" : "";
        gs.debug("Generated skill input for task " + data.taskId + " with " + ciLines.length + " CIs and " + conflictingAttributes.length + " conflicting attributes");

        return ciData;
    },

    _detectConflictingAttributes: function(attributesArray) {
        if (!attributesArray || attributesArray.length === 0) {
            return [];
        }

        var conflictingKeys = [];

        // Collect all unique attribute keys (excluding system fields)
        var allKeys = {};
        for (var i = 0; i < attributesArray.length; i++) {
            var ci = attributesArray[i];
            for (var key in ci) {
                if (ci.hasOwnProperty(key) && this.SYSTEM_FIELDS.indexOf(key) === -1) {
                    allKeys[key] = true;
                }
            }
        }

        // Check each attribute for conflicts
        var keys = Object.keys(allKeys);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var uniqueValues = {};

            for (var j = 0; j < attributesArray.length; j++) {
                var ci = attributesArray[j];
                var value;

                if (key in ci) {
                    value = ci[key].value;
                    if (value === "" || value === null || value === undefined) {
                        value = "__EMPTY__";
                    }
                } else {
                    // Attribute doesn't exist in this CI - treat as missing
                    value = "__MISSING__";
                }

                uniqueValues[value] = true;
            }

            // If more than one unique value, it's conflicting
            if (Object.keys(uniqueValues).length > 1) {
                conflictingKeys.push(key);
            }
        }

        gs.debug("Detected " + conflictingKeys.length + " conflicting attributes");
        return conflictingKeys;
    },

    _buildCILine: function(ci, relatedItemCountsObj, relationshipCountsObj, conflictingAttributes) {
        // Extract and validate system fields
        var sys_id = ci.sys_id && ci.sys_id.value;
        var created_on = ci.sys_created_on && ci.sys_created_on.value;
        var updated_on = ci.sys_updated_on && ci.sys_updated_on.value;
        var class_name = ci.sys_class_name && ci.sys_class_name.value;

        if (!sys_id || !created_on || !updated_on || !class_name) {
            gs.debug("Skipping CI due to missing system fields");
            return null;
        }

        // Build related item counts
        var relatedItemInfo = relatedItemCountsObj[sys_id];
        var relatedItemsCount = 0;
        var relatedTables = [];

        if (relatedItemInfo) {
            relatedItemsCount = relatedItemInfo.count || 0;
            var tableCounts = relatedItemInfo.relatedItemCount || {};
            var tableNames = Object.keys(tableCounts);

            for (var i = 0; i < tableNames.length; i++) {
                relatedTables.push(tableNames[i] + "=" + tableCounts[tableNames[i]]);
            }
        }

        var relatedStr = "related items count=" + relatedItemsCount +
            (relatedTables.length > 0 ? " (related items: " + relatedTables.join(", ") + ")" : "");

        // Build relationships count
        var relationshipsCount = relationshipCountsObj[sys_id] !== undefined ? relationshipCountsObj[sys_id] : 0;
        var relationshipsStr = "relationships count=" + relationshipsCount;

        // Build conflicting attribute strings
        var attrStrs = [];
        for (var i = 0; i < conflictingAttributes.length; i++) {
            var key = conflictingAttributes[i];

            if (key in ci) {
                var val = ci[key] && ci[key].value;
                if (val !== "" && val !== null && val !== undefined) {
                    attrStrs.push(key + "=" + val);
                }
            }
        }

        // Assemble the CI line
        var parts = [
            relatedStr,
            relationshipsStr,
            "sys_created_on=" + created_on,
            "sys_updated_on=" + updated_on,
            "sys_class_name=" + class_name
        ];

        parts = parts.concat(attrStrs);

        return sys_id + ": " + parts.join(", ");
    },

    _getHighestCommonClass: function(classNames) {
        if (!classNames || classNames.length === 0) {
            return null;
        }

        // Get hierarchies for all input classes
        var hierarchies = [];
        for (var i = 0; i < classNames.length; i++) {
            var classHierarchy = GlideDBObjectManager.get().getTables(classNames[i]).toArray();
            hierarchies.push(classHierarchy);
        }

        // Start with hierarchy of first class
        var common = hierarchies[0].slice();

        // Keep only those present in all hierarchies
        for (var i = 1; i < hierarchies.length; i++) {
            var current = hierarchies[i];
            var filtered = [];
            for (var j = 0; j < common.length; j++) {
                if (current.indexOf(common[j]) !== -1) {
                    filtered.push(common[j]);
                }
            }
            common = filtered;
        }

        // The first common class (from first hierarchy order) is the highest in the hierarchy
        var firstHierarchy = hierarchies[0];
        for (var k = 0; k < firstHierarchy.length; k++) {
            if (common.indexOf(firstHierarchy[k]) !== -1) {
                return firstHierarchy[k];
            }
        }

        return null;
    },

    _getNotSupportedMessage: function(taskData) {
        var messages = [];

        this._logAndPush(
            taskData.isLarge,
            messages,
            "Using AI is not supported for de-duplication tasks with more than " +
            this.DUPLICATE_REMEDIATOR_MAX_CIS + " CIs."
        );

        this._logAndPush(
            taskData.isDryRun,
            messages,
            "Using AI is not supported for de-duplication tasks running when " +
            this.DUPLICATE_REMEDIATOR_DRY_RUN_PROPERTY + " is enabled."
        );

        this._logAndPush(
            taskData.isInProgress,
            messages,
            "Using AI is not supported for de-duplication tasks in progress."
        );

        this._logAndPush(
            !taskData.isCmdbCi,
            messages,
            "Using AI is not supported for non-CMDB de-duplication tasks."
        );

        return messages.join(' ');
    },

    _logAndPush: function(condition, messages, msg) {
        if (condition) {
            gs.debug(msg);
            messages.push(msg);
        }
    },

    _getSkillInternalName: function() {
        var gr = new GlideRecord(this.NOW_ASSIST_SKILL_CONFIG);
        gr.addQuery(this.SKILL_ID, this.DUPLICATE_TASK_OPTIONS_RECOMMENDATION_CAPABILITY_ID);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.getValue(this.INTERNAL_NAME);
        }
        return undefined;
    },

    updateTemplateReviewBatchSizeProperty: function(newValue) {
        try {
            if (!gs.hasRole(this.CMDB_DEDUP_ADMIN_ROLE)) {
                gs.error('DuplicateTaskRecommendationsUtil: ' + this.CMDB_DEDUP_ADMIN_ROLE + ' role required to update ' + this.TEMPLATE_REVIEW_BATCH_SIZE_PROPERTY + '.');
                return;
            }
            // GlideRecord used directly because gs.setProperty() silently fails
            // Cannot use GlideRecordSecure as maint is allowed to create/update template properties - we gatekeep this with role check
            var gr = new GlideRecord(this.SYS_PROPERTIES);
            gr.addQuery(this.NAME_FIELD, this.TEMPLATE_REVIEW_BATCH_SIZE_PROPERTY);
            gr.query();
            if (gr.next()) {
                gr.setValue(this.VALUE_FIELD, newValue);
                if (!gr.update()) {
                    gs.warn('DuplicateTaskRecommendationsUtil: update() returned null for ' + this.TEMPLATE_REVIEW_BATCH_SIZE_PROPERTY + ', value may not have been persisted.');
                }
            } else {
                gr.initialize();
                gr.setValue(this.NAME_FIELD, this.TEMPLATE_REVIEW_BATCH_SIZE_PROPERTY);
                gr.setValue(this.VALUE_FIELD, newValue);
                if (!gr.insert()) {
                    gs.warn('DuplicateTaskRecommendationsUtil: insert() returned null for ' + this.TEMPLATE_REVIEW_BATCH_SIZE_PROPERTY + ', property may not have been created.');
                }
            }
        } catch (e) {
            gs.error('DuplicateTaskRecommendationsUtil: Error updating ' + this.TEMPLATE_REVIEW_BATCH_SIZE_PROPERTY + ' property - ' + e.message +
                (e.stack ? (' STACK: ' + e.stack) : ''));
        }
    },

    updateRecommendationTaskBatchSizeProperty: function(newValue) {
        try {
            if (!gs.hasRole(this.CMDB_DEDUP_ADMIN_ROLE)) {
                gs.error('DuplicateTaskRecommendationsUtil: ' + this.CMDB_DEDUP_ADMIN_ROLE + ' role required to update ' + this.RECOMMENDATION_TASK_BATCH_SIZE_PROPERTY + '.');
                return;
            }
            // GlideRecord used directly because gs.setProperty() silently fails
            // Cannot use GlideRecordSecure as maint is allowed to create/update template properties - we gatekeep this with role check
            var gr = new GlideRecord(this.SYS_PROPERTIES);
            gr.addQuery(this.NAME_FIELD, this.RECOMMENDATION_TASK_BATCH_SIZE_PROPERTY);
            gr.query();
            if (gr.next()) {
                gr.setValue(this.VALUE_FIELD, newValue);
                if (!gr.update()) {
                    gs.warn('DuplicateTaskRecommendationsUtil: update() returned null for ' + this.RECOMMENDATION_TASK_BATCH_SIZE_PROPERTY + ', value may not have been persisted.');
                }
            } else {
                gr.initialize();
                gr.setValue(this.NAME_FIELD, this.RECOMMENDATION_TASK_BATCH_SIZE_PROPERTY);
                gr.setValue(this.VALUE_FIELD, newValue);
                if (!gr.insert()) {
                    gs.warn('DuplicateTaskRecommendationsUtil: insert() returned null for ' + this.RECOMMENDATION_TASK_BATCH_SIZE_PROPERTY + ', property may not have been created.');
                }
            }
        } catch (e) {
            gs.error('DuplicateTaskRecommendationsUtil: Error updating ' + this.RECOMMENDATION_TASK_BATCH_SIZE_PROPERTY + ' property - ' + e.message +
                (e.stack ? (' STACK: ' + e.stack) : ''));
        }
    },

    type: 'DuplicateTaskRecommendationsUtil'
};
