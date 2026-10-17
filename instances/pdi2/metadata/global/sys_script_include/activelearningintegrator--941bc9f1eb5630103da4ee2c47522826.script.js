var ActiveLearningIntegrator = Class.create();

(function() {

    var tables = {
        CS_TOPIC: 'sys_cs_topic_language',
        NLU_MODEL: 'sys_nlu_model',
        NLU_MODEL_STATUS: 'sys_nlu_model_status',
        VA_CHAT_LOGS: "open_nlu_predict_intent_feedback",
        ML_LABEL_CANDIDATE: "ml_label_candidate",
        ML_LABELED_DATA: "ml_labeled_data",
        SYS_PROPERTIES: "sys_properties",
        ML_SOLUTION: "ml_solution"
    };

    var defaults = {
        IS_ENABLED: "false",
        MAX_MODELS: 20,
        MAX_VA_CHAT_LOGS_RECORDS: 3000

    };

    var sysProperties = {
        IS_ENABLED: "glide.mlpredictor.option.nlu.activeLearning.isEnabled",
        MAX_MODELS_LIMIT: "glide.mlpredictor.option.nlu.activeLearning.max_models_limit",
        MIN_VA_CHAT_LOGS_RECORDS: "glide.mlpredictor.option.nlu.activeLearning.va_chat_logs.min_row_limit",
        MAX_VA_CHAT_LOGS_RECORDS: "glide.mlpredictor.option.nlu.activeLearning.va_chat_logs.max_row_limit",
        VA_CHAT_LOGS_FILTERING_ON: "glide.mlpredictor.option.nlu.activeLearning.va_chat_logs.filtering_on",
        MAX_LABEL_DATA_RECORDS: "glide.mlpredictor.option.nlu.activeLearning.label_table.max_data_size",
        MAX_LABEL_CANDIDATE_DATA_RECORDS: "glide.mlpredictor.option.nlu.activeLearning.label_candidate_table.max_data_size",
        MAX_LABEL_CANDIDATE_DATA_RECORDS_IN_RESPONSE: "glide.mlpredictor.option.nlu.activeLearning.label_candidate_table.max_response_size"
    };

    ActiveLearningIntegrator.prototype = {
        initialize: function() {

        },
        train: function() {
            try {
                var isActiveLearningEnabled = this._getSysProperty(sysProperties.IS_ENABLED) || defaults.IS_ENABLED;
                if (isActiveLearningEnabled == "false") {
                    gs.debug('Active learning scheduled job is not enabled');
                    return null;
                }
                var modelData = this._getModels();
                var models = modelData.modelNames;
                if (!String.prototype.format) {
                    String.prototype.format = function() {
                        var args = arguments;
                        return this.replace(/{(\d+)}/g, function(match, number) {
                            return typeof args[number] != 'undefined' ?
                                args[number] :
                                match;
                        });
                    };
                }


                var vaChatLogsQuery = "";
                var vaChatLogsTimeQuery = "";
                var vaChatLogsModelQuery = "model IN ".concat(models.toString());
                var lastScheduledJobCreatedOn = this._getlastScheduledJobCreatedOn();
                var nluProviderId = NLUMappingsUtil.getSNNLUProvider();
                if (lastScheduledJobCreatedOn != null) {
                    vaChatLogsTimeQuery = "sys_created_on>={0}".format(lastScheduledJobCreatedOn);
                    vaChatLogsQuery = vaChatLogsTimeQuery.concat("^".concat(vaChatLogsModelQuery));
                    vaChatLogsQuery += "^OR".concat(vaChatLogsTimeQuery);
                    vaChatLogsQuery = vaChatLogsQuery.concat("^modelISEMPTY^nlu_provider.sys_id=".concat(nluProviderId));
                } else {
                    vaChatLogsQuery = vaChatLogsModelQuery;
                    vaChatLogsQuery = vaChatLogsQuery.concat("^ORmodelISEMPTY^nlu_provider.sys_id=".concat(nluProviderId));
                }
                var vaChatLogsCount = this._getVaChatLogsCount(models, vaChatLogsQuery);

                //validations
                if (models.length == 0 || vaChatLogsCount < parseInt(this._getSysProperty(sysProperties.MIN_VA_CHAT_LOGS_RECORDS))) {
                    gs.debug('Active learning scheduled job is cancelled due to less data');
                    return null;
                }
                var modelIds = modelData.modelSysIds;
                var authoringModels = this._getAuthoringModels(modelIds);
                var solutionInfo = {
                    "label": "active_learning",
                    "nluTrainingMode": "ActiveLearning"
                };



                //Defining datasets
                var VAChatLogsData = new sn_ml.DatasetDefinition({
                    'tableName': tables.VA_CHAT_LOGS,
                    'fieldNames': ['utterance', 'prediction', 'confidence', 'model', 'sys_created_on'],
                    'encodedQuery': vaChatLogsQuery
                });

                var lableCandidateData = new sn_ml.DatasetDefinition({
                    'tableName': tables.ML_LABEL_CANDIDATE,
                    'fieldNames': ['frequency', 'text', 'suggested_label', 'sys_id', 'product', 'source', 'last_received_time', 'recommendation']
                });

                var utteranceLabelData = new sn_ml.DatasetDefinition({
                    'tableName': tables.ML_LABELED_DATA,
                    'fieldNames': ['frequency', 'label', 'label_reference', 'label_table', 'label_type', 'product', 'source', 'text', 'usage', 'recommendation']
                });

                var datasets = {
                    "va_chat_logs": VAChatLogsData,
                    "labelling_candidates_table": lableCandidateData,
                    "utterance_label_table": utteranceLabelData

                };

                //Defining pipeline input
                var pipelineInput = {
                    "datasets": datasets,
                    "config": {
                        "authoring_models_list": authoringModels,
                        "max_label_data_records": parseInt(this._getSysProperty(sysProperties.MAX_LABEL_DATA_RECORDS)),
                        "max_label_candidate_data_records": parseInt(this._getSysProperty(sysProperties.MAX_LABEL_CANDIDATE_DATA_RECORDS)),
                        "max_label_candidate_data_records_in_response": parseInt(this._getSysProperty(sysProperties.MAX_LABEL_CANDIDATE_DATA_RECORDS_IN_RESPONSE)),
                        "va_chat_logs_rows_limit": parseInt(this._getSysProperty(sysProperties.MAX_VA_CHAT_LOGS_RECORDS)),
                        "filtering_on": (this._getSysProperty(sysProperties.VA_CHAT_LOGS_FILTERING_ON) == "true")
                    }
                };

                //Attaching all Active learning sys properties to config
                pipelineInput["config"]["sys_properties"] = this._getAllActiveLearningSysProperties();

                //Defining pipeline info
                var pipelineInfo = {
                    "label": solutionInfo.label,
                    "description": "Active Learning solution",
                    "schedulingInfo": {
                        "useCase": "Active Learning Solution"
                    },
                    "tags": [
                        "Active learning"
                    ],
                    "workflowConfiguration": {
                        "trainingFrequency": "run_once"
                    },
                    "trainingPipeline": {
                        "pipelineInput": pipelineInput,
                        "pipelineName": "active_learning_workflow",
                        "pipelineOutput": {
                            "models": {
                                "active_learning_report": "::dsl_active_learning.outputModel"
                            }
                        }
                    }
                };

                var solutionPipeline = new sn_ml.WorkflowSolution(pipelineInfo);
                var solutionName = sn_ml.WorkflowSolutionStore.add(solutionPipeline);

                var repName = solutionName + "_active_learning_report";

                pipelineInfo.trainingPipeline.pipelineInput = pipelineInput;
                pipelineInfo.trainingPipeline.pipelineOutput.models = {};
                pipelineInfo.trainingPipeline.pipelineOutput.models[repName] = "::dsl_active_learning.outputModel";

                solutionPipeline = new sn_ml.WorkflowSolution(pipelineInfo);
                sn_ml.WorkflowSolutionStore.update(solutionName, solutionPipeline);

                // Submit training job
                var solutionVersion = solutionPipeline.submitTrainingJob();
                gs.debug("props: " + JSON.stringify(solutionVersion.getProperties()));
                return solutionName;
            } catch (e) {
                gs.warn('Error creating Active learning definition:' + e.message + '\n' + e);
            }
        },

        _getAuthoringModels: function(modelIds) {
            var authoringModels = [];
            modelIds.forEach(function(modelId) {
                nluModel = new NLUModel(modelId);
                modelGr = nluModel.getGR();
                trainJson = NLUStudioTrainer.getTrainJson(nluModel, new NLUParloIntegrator(modelGr));
                authoringModels.push(trainJson);
            });
            return authoringModels;
        },

        _getVaChatLogsCount: function(models, query) {
            if (models.length == 0) {
                return 0;
            }
            var ga = new GlideAggregate(tables.VA_CHAT_LOGS);
            ga.addAggregate('COUNT');
            ga.addEncodedQuery(query);
            ga.query();
            var count = ga.next() && ga.getAggregate('COUNT');
            return count;
        },

        _getModelUniqueIds: function(models) {
            var modelIds = [];
            models.forEach(function(model) {
                var gr = new GlideRecord(tables.NLU_MODEL);
                gr.addQuery('name', model);
                gr.query();
                while (gr.next()) {
                    modelIds.push(gr.getUniqueValue());
                }
            });
            return modelIds;
        },

        _getModels: function() {
            var nluProviderId = NLUMappingsUtil.getSNNLUProvider();
            if (!nluProviderId) {
                gs.debug('NLU Provider is NOT active');
                return [];
            }
            var va_models = [];
            var gr = new GlideRecord(tables.CS_TOPIC);
            gr.addQuery('nlu_provider', nluProviderId);
            gr.addQuery('language_code', 'en');
            gr.orderByDesc('sys_updated_on');
            gr.query();
            while (gr.next()) {
                var model = gr.getValue('nlu_model');
                if (va_models.indexOf(model) === -1)
                    va_models.push(model);
            }

            var models = [];
            var modelSysIds = [];
            var modelNames = [];
            gr = GlideRecord(tables.NLU_MODEL_STATUS);
            gr.addQuery('state', "published");
            gr.addQuery('model.language', 'en');
            gr.addQuery('model.name', 'IN', va_models.join(','));
            gr.orderByDesc('sys_updated_on');
            gr.query();
            while (gr.next()) {
                var modelName = gr.model.name.toString();
                if (modelNames.indexOf(modelName) === -1) {
                    modelNames.push(modelName);
                    modelSysIds.push(gr.getValue("model"));
                }

            }

            var max_models = parseInt(this._getSysProperty(sysProperties.MAX_MODELS_LIMIT)) || defaults.MAX_MODELS;
            if (models.length > max_models) {
                models = models.slice(0, max_models);
            }
            return {
                modelSysIds: modelSysIds,
                modelNames: modelNames
            };

        },

        _getSysProperty: function(key) {
            var value = null;
            var sys_gr = new GlideRecord(tables.SYS_PROPERTIES);
            sys_gr.addQuery("name", key);
            sys_gr.query();
            while (sys_gr.next()) {
                value = sys_gr.getValue("value");
            }
            return value;
        },

        _getAllActiveLearningSysProperties: function() {
            var sys_gr = new GlideRecord(tables.SYS_PROPERTIES);
            sys_gr.addEncodedQuery("nameSTARTSWITHglide.mlpredictor.option.nlu.activeLearning");
            sys_gr.query();
            var properties = {};
            while (sys_gr.next()) {
                properties[sys_gr.getValue("name")] = sys_gr.getValue("value");
            }
            return properties;
        },

        _getlastScheduledJobCreatedOn: function() {
            var gr = new GlideRecord(tables.ML_SOLUTION);
            var last_created_time = null;
            gr.addQuery('progress', 100);
            gr.addEncodedQuery("solution_nameLIKEactive_learning^stateINsolution_complete");
            gr.orderByDesc('sys_created_on');
            gr.setLimit(1);
            gr.query();
            while (gr.next()) {
                last_created_time = gr.getValue("sys_created_on");
            }
            return last_created_time;
        },

        type: 'ActiveLearningIntegrator'
    };
})();
