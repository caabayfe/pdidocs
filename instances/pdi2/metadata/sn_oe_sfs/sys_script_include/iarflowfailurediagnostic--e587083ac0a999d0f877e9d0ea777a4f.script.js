var IARFlowFailureDiagnostic = Class.create();
IARFlowFailureDiagnostic.prototype = {
    initialize: function() {},

    type: 'IARFlowFailureDiagnostic'
};

/**
 * @param the number of a task
 * @returns {task_sys_id, context_sys_id, task_table_name}, or null if task is not found
 */
IARFlowFailureDiagnostic.findTaskInContextTable = function(task_number) {
    var gr = new GlideRecord("sys_cs_auto_resolution_context");
    gr.addQuery("task.number", vaInputs.task_number);
    gr.query();
	var result = {};
    if (gr.getRowCount() == 1) {
        gr.next();       
        result.task_sys_id = gr.task;
        result.context_sys_id = gr.sys_id;
        result.task_table_name = gr.task.sys_class_name;
		result.duplicate_task_in_context = "false";
        return result;
    }
	
	if (gr.getRowCount() > 1) {
		result.duplicate_task_in_context = "true";
		return result;
	}
    return null;
};

/*
 * @param the sys_id of the IAR context associated with an incident
 * @returns {state, state_message} of the task processing state
 */
IARFlowFailureDiagnostic.getIncidentStateAndMessage = function(context_sys_id) {
    var grContext = new GlideRecord("sys_cs_auto_resolution_context");
    grContext.get(context_sys_id);
    var result = {};
    result.state = grContext.getDisplayValue("task_processing_state");

    if (grContext.task_processing_state == "processed") {
        if (grContext.sla_state == "completed") 
            result.state_message = "This task was successfully resolved by the bot user.";
		
        else if (grContext.sla_state == "timeout") 
            result.state_message = "The SLA state is \"Timeout\" because the notification was sent to the notification user, but they did not respond in time.";
		
        else if (grContext.sla_state == "canceled") 
            result.state_message = "The SLA state is \"Canceled\" because the notification user chose to unassign this task from the bot user.";
		
		else
			result.state_message = "The notification has been sent out to the user on these Notification channels: " + grContext.getValue("response_channels");
		
    } else if (grContext.intent_topic_state == "intent_with_topic" && gs.nil(grContext.matched_topic)) 
        result.state_message = "This incident has the intent \"" + grContext.nlu_intent + ",\" but there is no matched topic for this reason:\n" + grContext.reason;
	
     else 
		result.state_message = grContext.reason || '';
	
    return result;
};

/*
 * @param the sys_id of the IAR context associated with an HR case
 * @returns {state, state_message} of the task processing state
 */
IARFlowFailureDiagnostic.getHRCaseStateAndMessage = function(context_sys_id) {
    var grContext = new GlideRecord("sys_cs_auto_resolution_context");
    grContext.get(context_sys_id);
    var result = {};
    result.state = grContext.getDisplayValue("task_processing_state");
    if (grContext.task_processing_state == "processed") {
        if (grContext.sla_state == "completed") 
            result.state_message = "This task was successfully resolved by the bot user.";
         
		else if (grContext.sla_state == "timeout") 
            result.state_message = "The SLA state is \"Timeout\" because the notification was sent to the notification user, but they did not respond in time.";
        
		else if (grContext.sla_state == "canceled") 
            result.state_message = "The SLA state is \"Canceled\" because the notification user chose to unassign this task from the bot user.";
        
		else
			result.state_message = "The notification has been sent out to the user on these Notification channels: " + grContext.getValue("response_channels");
		
    } else 
        result.state_message = grContext.reason || '';
    
    return result;
};

/*
 * @param the sys_id of the task
 * @returns {failed, failure_reason}, a boolean representing whether the Agent Zero prediction failed, if it failed, and a string with the reason
 */
IARFlowFailureDiagnostic.checkAgentZeroPrediction = function(task_sys_id) {
    try {
        var result = {
            failed: false,
            failure_reason: "",
        };
        var grTask = new GlideRecord('incident');
        grTask.get(task_sys_id);
        // configure optional parameters
        var options = {};
        options.top_n = 5;
        // query configuration language table for en
        var grML = new GlideRecord("sys_cs_auto_resolution_configuration_language");
        grML.addQuery("training_language", "en");
        grML.addQuery("configuration.target_table_name", "incident");
        grML.addQuery("active", "true");
        grML.query();
        grML.next();
        // get prediction results
        var mlSolution = sn_ml.AgentZeroSolutionStore.get(grML.ml_solution_name);
        var results = mlSolution.getActiveVersion().predict(grTask, options);
        // pretty print JSON results
        gs.info(JSON.stringify(JSON.parse(results), null, 2));
        return result;
    } catch (ex) {
        result.failed = true;
        result.failure_reason = ex.getMessage();
        return result;
    }
};

/*
 * @param the sys_id of the IAR context
 * @param the sys_id of the task
 * @param the table name of the task
 * @returns {failed, failure_reason}, a boolean representing whether the LanguageX prediction failed, if it failed, and a string with the reason
 */
IARFlowFailureDiagnostic.checkLanguageXPrediction = function(context_sys_id, task_sys_id, task_table_name) {
    var result = {
        failed: false,
        failure_reason: "",
    };
    var grContext = new GlideRecord("sys_cs_auto_resolution_context");
    grContext.get(context_sys_id);
    var inputs;
    if (!gs.nil(grContext.prediction)) {
        var grPrediction = new GlideRecord("sys_cs_auto_resolution_prediction");
        grPrediction.get(grContext.prediction);
        if (grPrediction.status_code != "200") {
            result.failed = true;
            result.failure_reason = "The Auto-Resolution prediction has a error code of " + grPrediction.status_code + ": " + grPrediction.status_message + ". ";
        }
        // inputs for LanguageX prediction check
        inputs = {
            id: task_sys_id,
            tableName: task_table_name,
            fields: JSON.parse(grPrediction.input_fields)
        };
    } else {
        result.failed = true;
        result.failure_reason = "There is no Auto-Resolution prediction for this HR case. ";
        // inputs for LanguageX prediction check
        inputs = {
            id: 'f0fdcd401bc70110f86c7597dc4bcb0c',
            tableName: 'sn_hr_core_case',
            fields: {
                description: 'I lost access to benefits portal'
            }
        };
    }

    // check LanguageX prediction results using inputs
    var solutionName = 'ml_sn_sn_iar_hr_global_issue_auto_resolution'; // new
    var langXInputs = [];
    langXInputs.push(inputs);
    var languageXSolution = sn_ml.LanguageXSolutionStore.get(solutionName);
    try {
        var results = JSON.parse(languageXSolution.getActiveVersion().predict(langXInputs));
        var logger = new sn_oe_sfs.IARDiagnosticHelper();
        logger.createLogger();
        var criticality = global.AutoResolutionLanguageXHelper.getOutputsByServiceName(results, "criticalityDetection", logger)[0].serviceOutput;
        var searchQuery = JSON.parse(global.AutoResolutionLanguageXHelper.getOutputsByServiceName(results, "searchQueryGeneration", logger)[0].serviceOutputDetails);
        var searchQueryScore = global.AutoResolutionLanguageXHelper.getOutputsByServiceName(results, "searchQueryGeneration", logger)[0].serviceOutputScore;
        // check if criticality or search query is empty
        if (gs.nil(criticality) || searchQuery.length == 0) {
            result.failed = true;
            result.failure_reason += "I ran a check on the LanguageX prediction server and I found the following issue(s):\n";
            if (gs.nil(criticality)) {
                result.failure_reason += "- Criticality is empty";
                if (searchQuery.length == 0) {
                    result.failure_reason += "\n";
                }
            }
            if (searchQuery.length == 0) {
                // check if search query score meets configuration query term threshold
                var grConfig = new GlideRecord("sys_cs_auto_resolution_configuration");
                grConfig.addQuery("target_table_name", task_table_name);
                grConfig.query();
                grConfig.next();
                if (!gs.nil(grContext.prediction) && searchQueryScore < grConfig.query_term_threshold) {
                    result.failure_reason += "- Search query is empty because the search query score of " + searchQueryScore + " did not meet the configuration's query term threshold of " + grConfig.query_term_threshold;
                } else {
                    result.failure_reason += "- Search query is empty";
                }
            }
        }
        return result;
    } catch (error) {
        result.failed = true;
        result.failure_reason += "I ran a check on the LanguageX prediction server, and it failed with this expection: " + error.getMessage();
        return result;
    }
};
