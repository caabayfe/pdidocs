var OneExtendEvaluationServiceUtil = Class.create();
OneExtendEvaluationServiceUtil.prototype = {
    initialize: function() {
        this.logger = new sn_log.GlideLogger("global.OneExtendEvaluationServiceUtil");
        this.CONSTANTS = {
            STATUS_COMPLETED: "completed",
            ERROR: "error",
            CANCELLED: "cancelled",
            STRING_TYPE: "string",
            NUMBER_TYPE: "number"
        };
        this.TABLES = {
            BATCH_RUN: "sys_one_extend_batch_run",
            BATCH_RESULT: "sys_one_extend_batch_result",
            TEST_RECORD: "sys_one_extend_test_record",
            EVAL_METRIC: "sys_one_extend_eval_metric_result",
            GENAI_METRIC: "sys_generative_ai_metric",
            SYS_TRIGGER: "sys_trigger",
            SYS_ALIAS: "sys_alias",
            API_KEY_CREDENTIALS: "api_key_credentials",
            HTTP_CONNECTION: "http_connection",
            REST_MESSAGE: 'sys_rest_message',
            REST_MESSAGE_FN: 'sys_rest_message_fn'
        };
        this.CAPABILITY_TYPE = {
            METRIC: "metric"
        };
        this.BATCH_RUN_FIELDS = {
            STATUS: "status"
        };
        this.BATCH_RESULT_FIELDS = {
            SYS_ID: "sys_id",
            GROUNDED_PROMPT: "grounded_prompt",
            BATCH_RUN: "batch_run",
            RESPONSE: "response",
            PROCESSED_RESPONSE: "processed_response",
            TEST_RECORD: "test_record",
            STATUS: "status"
        };
        this.BATCH_RESULT_DTO_FIELDS = {
            SYS_ID: "sysId",
            GROUNDED_PROMPT: "groundedPrompt",
            RESPONSE: "response",
            PROCESSED_RESPONSE: "processedResponse",
            TEST_RECORD: "testRecord",
            CONTEXT: "context"
        };
        this.TEST_RECORD_FIELDS = {
            SYS_ID: "sys_id",
            GOLDEN_RESPONSE: "golden_response",
        };
        this.GENAI_METRIC_FIELDS = {
            SYS_ID: "sys_id",
            NAME: "name",
            SCORE: "score",
            VALUE: "value",
            SYS_GENERATIVE_AI_LOG: "sys_generative_ai_log",
            TYPE: "type"
        };
        this.EVAL_METRIC_FIELDS = {
            SYS_ID: "sys_id",
            BATCH_RESULT: "batch_result",
            BATCH_RUN: "batch_run",
            METRIC: "metric",
            GROUNDED_PROMPT: "grounded_prompt",
            RESPONSE: "response",
            STATUS: "status",
        };
        this.FUNCTION_NAME = 'postMessage';
    },
    getGroundedPrompt: function(inputs) {
        if (typeof(inputs) == "string") {
            inputs = JSON.parse(inputs);
        }
        var batchResult = this.getBatchresult(inputs._meta);
        if (!gs.nil(batchResult)) {
            var predictedResponse = batchResult[this.BATCH_RESULT_DTO_FIELDS.GROUNDED_PROMPT];
            return predictedResponse;
        }
        return "";
    },
    getSkillContext: function(inputs) {
        if (typeof(inputs) == "string") {
            inputs = JSON.parse(inputs);
        }
        var batchResult = this.getBatchresult(inputs._meta);
        if (!gs.nil(batchResult)) {
            var skillContext = batchResult[this.BATCH_RESULT_DTO_FIELDS.CONTEXT];
            return skillContext;
        }
        return "";
    },
    getPredictedResponse: function(inputs) {
        if (typeof(inputs) == "string") {
            inputs = JSON.parse(inputs);
        }
        var batchResult = this.getBatchresult(inputs._meta);
        if (!gs.nil(batchResult)) {
            var predictedResponse = batchResult[this.BATCH_RESULT_DTO_FIELDS.RESPONSE];
            return predictedResponse;
        }
        return "";
    },
    getProcessedResponse: function(inputs) {
        if (typeof(inputs) == "string") {
            inputs = JSON.parse(inputs);
        }
        var batchResult = this.getBatchresult(inputs._meta);
        if (!gs.nil(batchResult)) {
            var processedResponse = batchResult[this.BATCH_RESULT_DTO_FIELDS.PROCESSED_RESPONSE];
            return processedResponse;
        }
        return "";
    },
    getApplicabilityScript: function(capabilityId) {
        return "(function(currentInputs, context) {\n /* customize condition logic here, return true or false */\n  var featureInput = currentInputs; \n  if (typeof featureInput === \"string\") {\n featureInput = JSON.parse(featureInput);\n    }\n\n    var metrics = featureInput && featureInput._meta && featureInput._meta.evaluationDetails && featureInput._meta.evaluationDetails.metrics;\n\n    return metrics && metrics.indexOf(\"" + capabilityId + "\") !== -1; //check for capability id of the metric\n})(currentInputs, context);";
    },
    getBatchresult: function(meta) {
        if (gs.nil(meta)) return null;
        var batchResultId = meta.evaluationDetails.batchResultId;
        var batchResults = sn_one_extend.OneExtendUtil.getBatchResults("sys_id=" + batchResultId);
        if (batchResults.length > 0) {
            return batchResults[0];
        }
        return null;
    },
    storePostProcessorResponse: function(input, processedResponse) {},

    storeStandardMetricEvalResults: function(inputs, response) {
        var evaluationDetails = {};
        var capabilityType = "";
        var capabilityId = "";
        var capabilityDetails = "";
        if (inputs.input && inputs.input._meta && inputs.input._meta.evaluationDetails) {
            capabilityType = inputs.input._meta.capability_type;
            capabilityId = inputs.input._meta.capability;
            evaluationDetails = inputs.input._meta.evaluationDetails;
            capabilityDetails = sn_one_extend.OneExtendUtil.getCapabilityByLanguageCode(capabilityId, 'en');
        } else {
            return;
        }
        if (capabilityType == this.CAPABILITY_TYPE.METRIC) {
            var responseList = response.response;
            if (!responseList) {
                this.insertErrorMetricResult(evaluationDetails.batchRunId, evaluationDetails.batchResultId, capabilityDetails);
                return;
            }
            var index = 0;
            while (index < responseList.length) {
                var currentResponse = responseList[index++];
                if (typeof currentResponse == this.CONSTANTS.STRING_TYPE) {
                    currentResponse = JSON.parse(currentResponse);
                }
                if (this.isValidResponse(currentResponse))
                    this.storeStandardMetricResults(currentResponse, evaluationDetails, capabilityDetails);
                else
                    this.insertErrorMetricResult(evaluationDetails.batchRunId, evaluationDetails.batchResultId, capabilityDetails);
            }
        }
    },
    storeStandardMetricResults: function(response, evaluationDetails, capabilityDetails) {
        var batchResultGr;
        try {
            var batchResultId = evaluationDetails.batchResultId;
            var batchRunId = evaluationDetails.batchRunId;
            var isLastRequest = evaluationDetails.isLastRequest;
            batchResultGr = new GlideRecord(this.TABLES.BATCH_RESULT);
            batchResultGr.get(batchResultId);
            var metricJson = {
                "name": response.name,
                "score": response.score,
                "value": response.value,
                "type": capabilityDetails.name,
            };
            var genAiMetric = this._insertGenAiMetrics(metricJson);

            var evalMetricJson = {
                "batchResult": batchResultId,
                "batchRun": batchRunId,
                "metric": genAiMetric,
                "grounded_prompt": response.metricInputs,
                "response": JSON.stringify(metricJson),
                "status": response.status
            };
            if (response.hasOwnProperty('additionalInfo')) {
                evalMetricJson['additionalInfo'] = JSON.stringify(response['additionalInfo']);
            }
            var evalMetricId = this._insertEvalMetric(evalMetricJson);
            if (response.hasOwnProperty('childMetrics')) {
                this._storeChildMetricsResults(response, genAiMetric, evaluationDetails, capabilityDetails.name);
            }
            return evalMetricId;
        } catch (e) {
            if (batchResultGr.isValidRecord()) {
                this.insertErrorMetricResult(evaluationDetails.batchRunId, evaluationDetails.batchResultId, capabilityDetails);
            }
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "EvalMetricProcessor: Error in processing standard metrics response: {exception}", {
                "exception": e
            }));
        }
        return null;
    },

    _storeChildMetricsResults: function(response, genAiMetric, evaluationDetails, capabilityName) {
        var childMetrics = response['childMetrics'] || [];
        for (var childMetricIndex = 0; childMetricIndex < childMetrics.length; childMetricIndex++) {
            if (!childMetrics[childMetricIndex]) {
                this.logger.warn(sn_i18n.Message.getMessage("com.glide.oneextend", "_storeChildMetricsResults: child metric details not found for parent metric: {{genAiMetric}}", {
                    "genAiMetric": genAiMetric
                }));
                continue;
            }
            var metricJson = {
                "name": childMetrics[childMetricIndex].name,
                "score": childMetrics[childMetricIndex].score,
                "value": childMetrics[childMetricIndex].value,
                "type": capabilityName,
            };
            var childGenAIMetric = this._insertGenAiMetrics(metricJson);

            var evalMetricJson = {
                "batchResult": evaluationDetails.batchResultId,
                "batchRun": evaluationDetails.batchRunId,
                "metric": childGenAIMetric,
                "parentMetric": genAiMetric,
                "grounded_prompt": childMetrics[childMetricIndex].metricInputs || response.metricInputs,
                "response": JSON.stringify(metricJson),
                "status": childMetrics[childMetricIndex].status || response.status
            };
            if (response.hasOwnProperty('additionalInfo')) {
                evalMetricJson['additionalInfo'] = JSON.stringify(response['additionalInfo']);
            }
            this._insertEvalMetric(evalMetricJson);
        }
    },

    // response is supposed to have name , score and value. score should be numeric
    isValidResponse: function(response) {
        var fields = ["name", "value", "score"];
        for (var i = 0; i < fields.length; i++) {
            if (!response.hasOwnProperty(fields[i]))
                return false;
        }
        if (typeof response.score == this.CONSTANTS.STRING_TYPE)
            return !isNaN(Number(response.score));
        if (!(typeof response.score == this.CONSTANTS.NUMBER_TYPE))
            return false;
        return true;
    },
    insertErrorMetricResult: function(batchRunId, batchResultId, capabilityDetails) {
        if (!capabilityDetails)
            return;
        var metricJson = {
            "name": capabilityDetails.name,
            "type": capabilityDetails.name,
        };
        var genAiMetric = this._insertGenAiMetrics(metricJson);
        var evalMetricJson = {
            "batchResult": batchResultId,
            "batchRun": batchRunId,
            "metric": genAiMetric,
            "grounded_prompt": "",
            "response": "",
            "status": this.CONSTANTS.ERROR
        };
        this._insertEvalMetric(evalMetricJson);
    },
    processEvalResults: function(inputs) {},
    processMetricResults: function(logId, evaluationDetails, metricCapabilityId, inputs) {
        var batchResultGr;
        try {
            var batchResultId = evaluationDetails.batchResultId;
            var batchRunId = evaluationDetails.batchRunId;
            var isLastRequest = evaluationDetails.isLastRequest;
            var logObj = sn_one_extend.GenerativeAIUtility.getGenerativeAILog(logId);
            modelResponse = logObj.response;
            if (typeof(modelResponse) == "string") {
                modelResponse = JSON.parse(modelResponse);
            }
            var capabilityDetails = sn_one_extend.OneExtendUtil.getCapability(metricCapabilityId, true);
            var metricJson = {
                "name": capabilityDetails.name,
                "score": "",
                "type": capabilityDetails.name,
                "logId": logId,
            };
            var genAiMetric = this._insertGenAiMetrics(metricJson);
            var status = (inputs.status == "success") ? this.CONSTANTS.STATUS_COMPLETED : inputs.status;
            var evalMetricJson = {
                "batchResult": batchResultId,
                "batchRun": batchRunId,
                "metric": genAiMetric,
                "grounded_prompt": logObj.prompt,
                "response": logObj.response,
                "status": status
            };
            return this._insertEvalMetric(evalMetricJson);
        } catch (e) {
            if (!gs.nil(batchResultGr)) {
                this._insertEvalMetric({
                    "batchResult": batchResultId,
                    "status": this.CONSTANTS.ERROR,
                });
            }
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "EvalMetricProcessor: Error in processing metrics response: {exception}", {
                "exception": e
            }));
        }
        return null;
    },
    processSkillResults: function(logId, postProcessedResponse, evaluationDetails, inputs) {
        try {
            var result = inputs.result;
            var prompt;
            var response;
            var logStats = "";
            var batchResultId = evaluationDetails.batchResultId;
            var batchRunId = evaluationDetails.batchRunId;
            var isLastRequest = evaluationDetails.isLastRequest;
            if (logId) {
                var logObj = sn_one_extend.GenerativeAIUtility.getGenerativeAILog(logId);
                prompt = logObj.prompt;
                response = logObj.response;
                logStats = {
                    promptTokenCount: logObj["promptTokenCount"],
                    responseTokenCount: logObj["responseTokenCount"],
                    completedAt: logObj["completedAt"],
                    startedAt: logObj["startedAt"],
                    timeTaken: logObj["timeTaken"]
                };
            } else {
                prompt = "";
                response = result;
            }
            var status = (inputs.status == "success") ? this.CONSTANTS.STATUS_COMPLETED : inputs.status;

            // insert metric for execution time
            var executionMetricJson = {
                "name": "Latency",
                "type": "Latency",
                "score": logObj["timeTaken"]
            };
            var metricId = this._insertGenAiMetrics(executionMetricJson);
            // insert evalmetric for execution time
            var executionEvalMetricJson = {
                "batchResult": batchResultId,
                "batchRun": batchRunId,
                "metric": metricId,
                "status": this.CONSTANTS.STATUS_COMPLETED,
            };
            this._insertEvalMetric(executionEvalMetricJson);


            this._updateBatchResult(batchResultId, logId, response, prompt, logStats, status);
            if (isLastRequest) {
                this._updateBatchRun(batchRunId, this.CONSTANTS.STATUS_COMPLETED);
            }
        } catch (e) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while executing callback handler: {exception}", {
                "exception": e
            }));
            return null;
        }
    },

    createSysTriggerToProcessDataset: function(sysId) {
        if (!GlideStringUtil.isEligibleSysID(sysId)) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while processing dataset. Invalid sysId passed: {sysid}", {
                "sysid": sysId
            }));
            return;
        }
        var userId = gs.getUserID();
        var datasetGr = new GlideRecord("sys_one_extend_test_dataset");
        datasetGr.get(sysId);
        var table = datasetGr.getValue("table");
        var script = this._getScriptToProcessDataset(table, sysId);
        if (script) {
            var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
            grTrigger.initialize();
            grTrigger.setValue('name', 'Process test dataset - ' + sysId);
            grTrigger.setValue('trigger_type', 0);
            grTrigger.setValue('script', script);
            grTrigger.setValue('state', 0);
            grTrigger.next_action.setDateNumericValue(0);
            grTrigger.claimed_by = '';
            return grTrigger.insert();
        }
        return sn_one_extend.OneExtendUtil.processTestDataset(sysId);
    },

    createSysTriggerToProcessAgenticAutoChat: function(sysId, table) {
        if (!GlideStringUtil.isEligibleSysID(sysId)) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while processing agentic auto chat . Invalid sourcedataset sysId passed: {sysid}", {
                "sysid": sysId
            }));
            return;
        }

        var script;
        if (gs.hasRole("maint")) {
            script = "new sn_skill_builder.AutoChatHelper().triggerAutoChats('" + sysId + "', '" + table + "');";
        } else {
            var userId = gs.getUserID();
            script = "new GlideImpersonate().impersonate('" + userId + "'); \n new sn_skill_builder.AutoChatHelper().triggerAutoChats('" + sysId + "', '" + table + "');";
        }

        var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
        grTrigger.initialize();
        grTrigger.setValue('name', 'Process Agentic Auto chat - ' + sysId);
        grTrigger.setValue('trigger_type', 0);
        grTrigger.setValue('script', script);
        grTrigger.setValue('state', 0);
        grTrigger.next_action.setDateNumericValue(0);
        grTrigger.claimed_by = '';
        return grTrigger.insert();
    },

    _getScriptToProcessDataset: function(table, testDatasetId) {
        var isMaintUser = gs.hasRole("maint");
        var userId = gs.getUserID();
        var isAutoChatDataset = this.isAutoChatDataset(testDatasetId);
        if (!isAutoChatDataset && isMaintUser) {
            return "sn_one_extend.OneExtendUtil.processTestDataset('" + testDatasetId + "', true);";
        }
        if (isAutoChatDataset) {
            if (isMaintUser) {
                return "new sn_skill_builder.AutoChatHelper().triggerAutoChats('" + testDatasetId + "', '" + table + "');";
            } else {
                return "new GlideImpersonate().impersonate('" + userId + "'); \n new sn_skill_builder.AutoChatHelper().triggerAutoChats('" + testDatasetId + "', '" + table + "');";
            }
        }
        return "new GlideImpersonate().impersonate('" + userId + "'); \n sn_one_extend.OneExtendUtil.processTestDataset('" + testDatasetId + "');";

    },

    impersonateUser: function(userId) {
        new GlideImpersonate().impersonate(userId);
    },

    getDecryptedTokenValue: function(tokenSysId) {
        try {
            var tokenVerification = new GlideRecord("token_verification");
            if (tokenVerification.get(tokenSysId)) {
                return tokenVerification.token.getDecryptedValue();
            }
            return null;
        } catch (e) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: failed to decrypt token: {sysid} due to error: {error}", {
                "sysid": tokenSysId,
                "error": e
            }));
            return null;
        }
    },

    getCatalogQuestions: function(sysId) {
        var set = new GlideappVariablePoolQuestionSet();
        set.setRequestID(sysId);
        set.load();
        var vs = set.getFlatQuestions();
        var varArr = {};
        for (var i = 0; i < vs.size(); i++) {
            if ((vs.get(i).getLabel() != '') && (vs.get(i).getDisplayValue() != '') && (vs.get(i).getLabel() != 'Requestor')) {
                varArr[vs.get(i).getLabel()] = vs.get(i).getDisplayValue();
            }
        }
        return varArr;
    },

    getJsonFromCompressedHeader: function(compressedHeader) {
        var decodedBytes = GlideStringUtil.base64DecodeAsBytes(compressedHeader);
        var decodedData = String(GlideCompressionUtil.expandToString(decodedBytes));
        var jsonResponse = gs.xmlToJSON(decodedData);
        return jsonResponse;
    },

    isAutoChatDataset: function(datasetId) {
        var acHelper = new sn_skill_builder.AutoChatHelper();
        var supportedTables = acHelper.getSupportedTables();
        var datasetGR = new GlideRecord("sys_one_extend_test_dataset");
        if (datasetGR.get(datasetId)) {
            var datasetTable = datasetGR.getValue("table");
            if (supportedTables.indexOf(datasetTable) != -1) {
                return true;
            }
        }
        return false;
    },

    createSysTriggerToDeleteDataset: function(sysId) {
        if (!GlideStringUtil.isEligibleSysID(sysId)) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while deleting dataset. Invalid sysId passed: {sysid}", {
                "sysid": sysId
            }));
            return;
        }
        var userId = gs.getUserID();
        var script = "new GlideImpersonate().impersonate('" + userId + "'); \n sn_one_extend.OneExtendUtil.deleteTestDataset('" + sysId + "');";
        var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
        grTrigger.initialize();
        grTrigger.setValue('name', 'Delete test dataset - ' + sysId);
        grTrigger.setValue('trigger_type', 0);
        grTrigger.setValue('script', script);
        grTrigger.setValue('state', 0);
        grTrigger.next_action.setDateNumericValue(0);
        grTrigger.claimed_by = '';
        return grTrigger.insert();
    },

    createSysTriggerToExecuteEvalRun: function(batchRunId, retryRequest) {
        if (!GlideStringUtil.isEligibleSysID(batchRunId)) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while executing eval run. Invalid batchRunId passed: {sysid}", {
                "sysid": batchRunId
            }));
            return;
        }
        if (gs.nil(retryRequest)) {
            retryRequest = false;
        }
        var userId = gs.getUserID();
        var script = "new GlideImpersonate().impersonate('" + userId + "'); \n new sn_skill_builder.NowAssistSkillKitAPI().executeEvaluationRun('" + batchRunId + "', " + retryRequest + ");";
        var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
        grTrigger.initialize();
        grTrigger.setValue('name', 'Execute eval run - ' + batchRunId);
        grTrigger.setValue('trigger_type', 0);
        grTrigger.setValue('script', script);
        grTrigger.setValue('state', 0);
        grTrigger.next_action.setDateNumericValue(0);
        grTrigger.claimed_by = '';
        return grTrigger.insert();
    },

    createSysTriggerToProcessDatasetAndEvalRun: function(batchRunId, testDatasetId) {
        if (!GlideStringUtil.isEligibleSysID(batchRunId) || !GlideStringUtil.isEligibleSysID(testDatasetId)) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while processing dataset and executing eval run. Invalid batchRunId or testDatasetId passed: {batchrunid}, {testdatasetid}", {
                "batchrunid": batchRunId,
                "testdatasetid": testDatasetId
            }));
            return;
        }

        try {
            var userId = gs.getUserID();
            var script;
            if (gs.hasRole("maint")) {
                script = "try { sn_one_extend.OneExtendUtil.processTestDataset('" + testDatasetId + "', true); \n new sn_skill_builder.NowAssistSkillKitAPI().executeEvaluationRun('" + batchRunId + "', false); } catch(e){ gs.debug(sn_i18n.Message.getMessage('OneExtendEvaluationServiceUtil: Error while processing dataset and triggering evaluation run: {exception}', {'exception': e})) }";
            } else {
                script = "new GlideImpersonate().impersonate('" + userId + "'); \n try { sn_one_extend.OneExtendUtil.processTestDataset('" + testDatasetId + "'); \n new sn_skill_builder.NowAssistSkillKitAPI().executeEvaluationRun('" + batchRunId + "', false); } catch(e){ gs.debug(sn_i18n.Message.getMessage('OneExtendEvaluationServiceUtil: Error while processing dataset and triggering evaluation run: {exception}', {'exception': e})) }";
            }

            var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
            grTrigger.initialize();
            grTrigger.setValue('name', 'Process test dataset - ' + testDatasetId + 'Process batch run - ' + batchRunId);
            grTrigger.setValue('trigger_type', 0);
            grTrigger.setValue('script', script);
            grTrigger.setValue('state', 0);
            grTrigger.next_action.setDateNumericValue(0);
            grTrigger.claimed_by = '';
            return grTrigger.insert();
        } catch (e) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while processing dataset and triggering evaluation run: {exception}", {
                "exception": e
            }));
            throw new Error(e);
        }
    },

    createSystrigger: function(current) {
        var evalRunId = current.getValue("batch_run");
        var script = "var evalRunIdCopy = sn_one_extend.OneExtendUtil.copyEvaluationRun('" + evalRunId + "'); " +
            "new sn_skill_builder.NowAssistSkillKitAPI().executeEvaluationRun('" + evalRunIdCopy + "', false);";
        var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
        grTrigger.initialize();
        grTrigger.setValue('name', 'Eval run schedule');
        grTrigger.setValue('trigger_type', 1);
        grTrigger.setValue('repeat', current.getValue('repeat'));
        grTrigger.setValue('script', script);
        grTrigger.setValue('max_drift', new GlideDuration(43200000));
        return grTrigger.insert();
    },
    updateSysTrigger: function(current, triggerId) {
        var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
        if (grTrigger.get(triggerId)) {
            grTrigger.setValue('repeat', current.getValue('repeat'));
            grTrigger.update();
        }
    },
    deleteSysTrigger: function(triggerId) {
        var grTrigger = new GlideRecord(this.TABLES.SYS_TRIGGER);
        if (grTrigger.get(triggerId)) {
            grTrigger.deleteRecord();
        }
    },
    scheduleEvalRun: function(current) {
        try {
            var triggerId;
            if (current.operation() == "insert") {
                triggerId = this.createSystrigger(current);
                current.setValue("trigger_id", triggerId);
            } else if (current.operation() == "update") {
                triggerId = current.getValue("trigger_id");
                this.updateSysTrigger(current, triggerId);
            } else if (current.operation() == "delete") {
                triggerId = current.getValue("trigger_id");
                this.deleteSysTrigger(triggerId);
            }
        } catch (e) {
            this.logger.error(sn_i18n.Message.getMessage("com.glide.oneextend", "OneExtendEvaluationServiceUtil: Error while scheduling evaluation run: {exception}", {
                "exception": e
            }));
            return null;
        }
        return triggerId;
    },
    _updateBatchResult: function(batchResultId, logId, response, groundedPrompt, logStats, status) {
        if (typeof response == "object") {
            response = JSON.stringify(response);
        }
        var batchResult = {
            "id": batchResultId,
            "response": response,
            "groundedPrompt": groundedPrompt,
            "status": status,
            "genAILogId": logId || "",
            "executionStats": JSON.stringify(logStats)
        };
        sn_one_extend.OneExtendUtil.updateBatchResultResponse(batchResult);
    },
    _updateBatchRun: function(batchRunId, status) {
        var gr = new GlideRecord(this.TABLES.BATCH_RUN);
        if (gr.get(batchRunId)) {
            gr.setValue(this.BATCH_RUN_FIELDS.STATUS, status);
            gr.update();
        }
    },
    upsertEvalMetric: function(input) {
        sn_one_extend.OneExtendUtil.upsertEvalMetric(input);
    },

    _insertEvalMetric: function(evalMetricJson) {
        return sn_one_extend.OneExtendUtil.insertEvalMetric(evalMetricJson);
    },

    _insertGenAiMetrics: function(metricJson) {
        return sn_one_extend.OneExtendUtil.insertGenAiMetric(metricJson);
    },

    /**
     * We are using error codes within the callee methods.
     * These codes will not be displayed to the user. Instead, they will be leveraged internally within the callee methods to show the appropriate message.
     */
    _throwError: function(code, message) {
        var err = new Error(message);
        err.code = code;
        throw err;
    },

    updateConnectionAndAPIKeyCredential: function(sysAliasId, name, connectionName, connectionUrl, apiKey, useMID) {
        if (!sysAliasId) {
            this._throwError(1001, 'Error: sysAliasId is required.');
        }

        var aliasGR = new GlideRecord(this.TABLES.SYS_ALIAS);
        if (!aliasGR.get(sysAliasId)) {
            this._throwError(1002, 'Error: sys_alias not found or access denied: ' + sysAliasId);
        }

        aliasGR.setValue("name", String(name).trim());
        if (!aliasGR.update()) {
            this._throwError(1003, 'Error: Failed to update sys_alias for id:' + aliasGR.getUniqueValue());
        }

        var hcGR = new GlideRecord('http_connection');
        hcGR.addQuery('connection_alias', sysAliasId);
        hcGR.addActiveQuery();
        hcGR.query();

        if (hcGR.next()) {
            if (connectionUrl) {
                hcGR.setValue('connection_url', String(connectionUrl).trim());
                hcGR.setValue('name', String(connectionName).trim());
                hcGR.setValue('use_mid', useMID);
            }

            if (apiKey) {
                var credId = hcGR.getValue('credential');
                if (!credId) {
                    this._throwError(1004, 'Error: Connection ' + hcGR.getUniqueValue() + ' has no linked credential.');
                }
                var akGR = new GlideRecord(this.TABLES.API_KEY_CREDENTIALS);
                if (akGR.get(credId) && akGR.isValidField('api_key')) {
                    akGR.setValue('name', name);
                    akGR.setDisplayValue('api_key', apiKey); // do not log the value
                    if (!akGR.update()) {
                        this._throwError(1005, 'Error: Failed to update api_key for credential ' + credId);
                    }
                } else {
                    this._throwError(1006, 'Error: Credential not in api_key_credentials or inaccessible: ' + credId);
                }
            }
            if (hcGR.update()) {
                var uniqueId = hcGR.getUniqueValue();
                this.logger.debug(sn_i18n.Message.getMessage("com.glide.oneextend", "http_connection is updated for id: {uniqueId}", {
                    "uniqueId": uniqueId
                }));
                return sysAliasId;
            } else {
                this._throwError(1007, 'Error: Connection name already exist with name: ' + name + ' in table http_connection. Failed to create http_connection for id:' + hcGR.getUniqueValue());
            }
        } else {
            var input = {};
            var table = this.TABLES.HTTP_CONNECTION;
            var connection = {
                name: name,
                table: table,
                connection_url: connectionUrl
            };

            input['connection'] = connection;
            input['credential'] = {
                table: "api_key_credentials",
                name: name,
                api_key: apiKey,
            };

            var ccBuilder = new sn_cc.ConnectionBuilder();
            var response = ccBuilder.createConnectionAndCredential(sysAliasId, input);
            if ((response || {}).getStatus() !== 'SUCCESS') {
                this._throwError(1008, response.getMessage() || "Error creating connection and credential.");
            }
        }
    },

    /**
     * Upserts REST message and REST message function records with the expected endpoint.
     * Creates records with proper configuration if they don't exist.
     * Updates only rest_endpoint if records exist.
     * 
     * @param {string} restMessageName - Name of the sys_rest_message record
     * @param {string} expectedEndpoint - The endpoint URL to set
     * @returns {Object} - Object containing update results with error info
     */
    upsertRestMessageEndpoints: function(restMessageName, expectedEndpoint) {
        var results = this._initUpsertResults();

        // Validate inputs
        if (gs.nil(restMessageName) || gs.nil(expectedEndpoint)) {
            results.isError = true;
            results.errorMessage = 'Invalid input - restMessageName or expectedEndpoint is empty';
            this.logger.error('upsertRestMessageEndpoints: ' + results.errorMessage);
            return results;
        }

        try {
            var restMessageGr = new GlideRecord(this.TABLES.REST_MESSAGE);
            restMessageGr.addQuery('name', restMessageName);
            restMessageGr.setLimit(1);
            restMessageGr.query();

            if (restMessageGr.next()) {
                results.restMessage = this._updateRestMessageIfNeeded(restMessageGr, expectedEndpoint, restMessageName);
                results.restMessageFn = this._upsertRestMessageFn(results.restMessage.sysId, this.FUNCTION_NAME, expectedEndpoint, this.TABLES.REST_MESSAGE_FN);
            } else {
                results.restMessage = this._createRestMessage(restMessageGr, restMessageName, expectedEndpoint);
                if (results.restMessage.isError) {
                    results.isError = true;
                    results.errorMessage = results.restMessage.errorMessage;
                    return results;
                }
                results.restMessageFn = this._createRestMessageFn(results.restMessage.sysId, this.FUNCTION_NAME, expectedEndpoint, this.TABLES.REST_MESSAGE_FN);
            }

            // Check for errors in child operations
            if (results.restMessage.isError || results.restMessageFn.isError) {
                results.isError = true;
                results.errorMessage = results.restMessage.errorMessage || results.restMessageFn.errorMessage;
            }

        } catch (e) {
            results.isError = true;
            results.errorMessage = 'Exception processing ' + restMessageName + ': ' + e.message;
            this.logger.error('upsertRestMessageEndpoints: ' + results.errorMessage);
        }

        return results;
    },

    _initUpsertResults: function() {
        return {
            isError: false,
            errorMessage: '',
            restMessage: {
                sysId: null,
                message: '',
                isError: false,
                errorMessage: ''
            },
            restMessageFn: {
                sysId: null,
                message: '',
                isError: false,
                errorMessage: ''
            }
        };
    },

    _updateRestMessageIfNeeded: function(gr, expectedEndpoint, name) {
        var result = {
            sysId: gr.getUniqueValue(),
            message: '',
            isError: false,
            errorMessage: ''
        };

        try {
            var currentEndpoint = gr.getValue('rest_endpoint') || '';

            if (expectedEndpoint !== currentEndpoint) {
                gr.setValue('rest_endpoint', expectedEndpoint);
                var updateResult = gr.update();
                if (!updateResult) {
                    result.isError = true;
                    result.errorMessage = 'Failed to update sys_rest_message: ' + result.sysId;
                    this.logger.error('Upsert: ' + result.errorMessage);
                    return result;
                }
                result.message = 'Updated rest_endpoint';
                this.logger.info('Upsert: Updated sys_rest_message ' + result.sysId + ' (name: ' + name + ') endpoint to ' + expectedEndpoint);
            } else {
                result.message = 'No update needed - endpoint already correct';
            }
        } catch (e) {
            result.isError = true;
            result.errorMessage = 'Exception updating sys_rest_message: ' + e.message;
            this.logger.error('Upsert: ' + result.errorMessage);
        }
        return result;
    },

    _createRestMessage: function(gr, name, endpoint) {
        var result = {
            sysId: null,
            message: '',
            isError: false,
            errorMessage: ''
        };

        try {
            gr.initialize();
            gr.setValue('name', name);
            gr.setValue('rest_endpoint', endpoint);
            gr.setValue('access', 'public');
            gr.setValue('authentication_type', 'no_authentication');
            gr.setValue('use_basic_auth', false);
            gr.setValue('use_mutual_auth', false);

            var sysId = gr.insert();
            if (gs.nil(sysId)) {
                result.isError = true;
                result.errorMessage = 'Failed to insert sys_rest_message for name: ' + name;
                this.logger.error('Upsert: ' + result.errorMessage);
                return result;
            }

            result.sysId = sysId;
            result.message = 'Created new sys_rest_message record';
            this.logger.info('Upsert: Created sys_rest_message ' + sysId + ' (name: ' + name + ') with endpoint ' + endpoint);
        } catch (e) {
            result.isError = true;
            result.errorMessage = 'Exception creating sys_rest_message: ' + e.message;
            this.logger.error('Upsert: ' + result.errorMessage);
        }
        return result;
    },

    _upsertRestMessageFn: function(restMessageSysId, functionName, expectedEndpoint, tableName) {
        var result = {
            sysId: null,
            message: '',
            isError: false,
            errorMessage: ''
        };

        try {
            var fnGr = new GlideRecord(tableName);
            fnGr.addQuery('function_name', functionName);
            fnGr.addQuery('rest_message', restMessageSysId);
            fnGr.setLimit(1);
            fnGr.query();

            if (fnGr.next()) {
                return this._updateRestMessageFnIfNeeded(fnGr, expectedEndpoint, functionName);
            }
            return this._createRestMessageFn(restMessageSysId, functionName, expectedEndpoint, tableName);
        } catch (e) {
            result.isError = true;
            result.errorMessage = 'Exception in upsert sys_rest_message_fn: ' + e.message;
            this.logger.error('Upsert: ' + result.errorMessage);
        }
        return result;
    },

    _updateRestMessageFnIfNeeded: function(gr, expectedEndpoint, functionName) {
        var result = {
            sysId: gr.getUniqueValue(),
            message: '',
            isError: false,
            errorMessage: ''
        };

        try {
            var currentEndpoint = gr.getValue('rest_endpoint') || '';

            if (expectedEndpoint !== currentEndpoint) {
                gr.setValue('rest_endpoint', expectedEndpoint);
                var updateResult = gr.update();
                if (!updateResult) {
                    result.isError = true;
                    result.errorMessage = 'Failed to update sys_rest_message_fn: ' + result.sysId;
                    this.logger.error('Upsert: ' + result.errorMessage);
                    return result;
                }
                result.message = 'Updated rest_endpoint';
                this.logger.info('Upsert: Updated sys_rest_message_fn ' + result.sysId + ' (function_name: ' + functionName + ') endpoint to ' + expectedEndpoint);
            } else {
                result.message = 'No update needed - endpoint already correct';
            }
        } catch (e) {
            result.isError = true;
            result.errorMessage = 'Exception updating sys_rest_message_fn: ' + e.message;
            this.logger.error('Upsert: ' + result.errorMessage);
        }
        return result;
    },

    _createRestMessageFn: function(restMessageSysId, functionName, endpoint, tableName) {
        var result = {
            sysId: null,
            message: '',
            isError: false,
            errorMessage: ''
        };

        try {
            var fnGr = new GlideRecord(tableName);
            fnGr.initialize();
            fnGr.setValue('function_name', functionName);
            fnGr.setValue('rest_endpoint', endpoint);
            fnGr.setValue('rest_message', restMessageSysId);
            fnGr.setValue('http_method', 'post');
            fnGr.setValue('authentication_type', 'inherit_from_parent');
            fnGr.setValue('lock', false);
            fnGr.setValue('use_basic_auth', false);
            fnGr.setValue('use_mutual_auth', false);

            var sysId = fnGr.insert();
            if (gs.nil(sysId)) {
                result.isError = true;
                result.errorMessage = 'Failed to insert sys_rest_message_fn for function: ' + functionName;
                this.logger.error('Upsert: ' + result.errorMessage);
                return result;
            }

            result.sysId = sysId;
            result.message = 'Created new sys_rest_message_fn record';
            this.logger.info('Upsert: Created sys_rest_message_fn ' + sysId + ' (function_name: ' + functionName + ') with endpoint ' + endpoint);
        } catch (e) {
            result.isError = true;
            result.errorMessage = 'Exception creating sys_rest_message_fn: ' + e.message;
            this.logger.error('Upsert: ' + result.errorMessage);
        }
        return result;
    },

    _decryptApiKey: function(api_key, token, sys_id) {
        var apiKey = GlideEncryptionUtil.getClearPassword2(api_key, token, sys_id);
        return apiKey;
    },

    type: 'OneExtendEvaluationServiceUtil'
};
