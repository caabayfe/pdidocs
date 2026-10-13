var IntentDiscoveryIntegrator = Class.create();
IntentDiscoveryIntegrator.prototype = {
    initialize: function() {
        this.CLASSIFICATION_ONLY = "classification";
    },

    createJob: function(sysId, table, field, encodedQuery, extraOpts) {
        try {
            var authoringModel = {};
            var fieldNames = [field];
            if (extraOpts.user_fields && extraOpts.user_fields.length > 0) {
                fieldNames = fieldNames.concat(extraOpts.user_fields);
            }
            var solutionInfo = {
                "label": sysId,
                "nluTrainingMode": "CoverageReport",
                "datasetProperties": {
                    "tableName": table,
                    "fieldNames": fieldNames,
                    "encodedQuery": encodedQuery
                },
                "Coverage-Cluster-Lang": "ml",
                "Coverage_Text_Field": [field],
                "Coverage-Inlucde-Msg": false,
            };

            var inputDataset = new sn_ml.DatasetDefinition(solutionInfo.datasetProperties);
            var datasets = {
                "incidents": inputDataset
            };
            var pipelineInput = {
                "datasets": datasets,
                "config": {
                    "bot_id": extraOpts.bot_id,
                    "clustering": extraOpts.cluster_records,
                    "classification": extraOpts.classify_records,
                    "cluster_lang": solutionInfo["Coverage-Cluster-Lang"],
                    "authoring_model": authoringModel,
                    "fields": solutionInfo.Coverage_Text_Field
                }
            };
            var pipelineInfo = {
                "label": solutionInfo.label,
                "description": "An intent discovery coverage report solution",
                "schedulingInfo": {
                    "useCase": "Intent Discovery Solution"
                },
                "tags": [
                    "Intent discovery",
                    "workflow",
                    "coverage report"
                ],
                "workflowConfiguration": {
                    "trainingFrequency": "run_once"
                },
                "trainingPipeline": {
                    "pipelineInput": pipelineInput,
                    "pipelineName": "intent_discovery_v1",
                    "pipelineOutput": {
                        "info": {
                            "stats": "::reportGenerator.info"
                        },
                        "models": {
                            "report.json": "::reportGenerator.outputModel",
                            "_taxonomy.json": "::reportGenerator.outputTaxonomy"
                        }
                    }
                }
            };
            var solutionPipeline = new sn_ml.WorkflowSolution(pipelineInfo);
            var solutionName = sn_ml.WorkflowSolutionStore.add(solutionPipeline);

            var repName = solutionName + "-report.json";

            pipelineInput.datasets = datasets;
            pipelineInfo.trainingPipeline.pipelineInput = pipelineInput;
            pipelineInfo.trainingPipeline.pipelineOutput.models = {};
            pipelineInfo.trainingPipeline.pipelineOutput.models[repName] = "::reportGenerator.outputModel";
            pipelineInfo.trainingPipeline.pipelineOutput.models['_taxonomy.json'] = "::reportGenerator.outputTaxonomy";

            solutionPipeline = new sn_ml.WorkflowSolution(pipelineInfo);
            sn_ml.WorkflowSolutionStore.update(solutionName, solutionPipeline);

            // Submit training job
            var solutionVersion = solutionPipeline.submitTrainingJob();
            gs.debug("props: " + JSON.stringify(solutionVersion.getProperties()));
            return solutionName;
        } catch (e) {
            gs.warn('Error creating report definition:' + e.message + '\n' + e);
        }
    },

    getOptions: function(extraOpts, reportDef) {
        // Set model id if it wasn't overriden via API
        if (Object.keys(extraOpts).indexOf("bot_id") === -1 && reportDef.getValue("model") && reportDef.getValue("model").toLowerCase() == "hr") {
            extraOpts["bot_id"] = "atlas_hr";
        } else if (Object.keys(extraOpts).indexOf("bot_id") === -1) {
            extraOpts["bot_id"] = "atlas_itsm";
        }

        // Disable classification if no taxonomy is chosen
        if (!reportDef.getValue("model")) {
            extraOpts["classify_records"] = "False";
        } else {
            extraOpts["classify_records"] = "True";
        }

        var shouldCluster = reportDef.getValue("cluster_records");
        if (shouldCluster === 0 || shouldCluster === false || shouldCluster === "0") {
            extraOpts["Coverage-Job-Type"] = this.CLASSIFICATION_ONLY;
            extraOpts["cluster_records"] = "False";
        } else {
            extraOpts["cluster_records"] = "True";
        }
        return extraOpts;
    },

    rerun: function(solutionDefId, solutionDefRec, reportDef) {
        var solutionName = solutionDefRec.getValue('solution_name');

        var solution;
        var errorMsg;
        var status;
        try {
            solution = sn_ml.WorkflowSolutionStore.get(solutionName);
        } catch (e) {
            var IDUtil = new sn_nlu_discovery.IntentDiscoveryUtil();
            solutionName = IDUtil.createReport(reportDef);
            solution = sn_ml.WorkflowSolutionStore.get(solutionName);
            if (!gs.nil(solution)) {
                status = solution.getLatestVersion().getStatus();
                gs.debug('[DISC] Re-running solution training job ' + solutionName);
                return {
                    error: null,
                    status: status
                };
            }
        }
        if (gs.nil(solution)) {
            errorMsg = 'Cannot load solution with name ' + solutionName;
            gs.warn('[DISC] rerun_report: ' + errorMsg);
            return {
                error: errorMsg
            };
        }

        status = solution.getLatestVersion().getStatus();
        status = status ? JSON.parse(status) : status;
        gs.debug('[DISC] Solution training job status before re-running is ' + status + ', status.hasJobEnded=' + JSON.stringify(status.hasJobEnded));

        if (status && status.hasJobEnded == 'true') {
            gs.debug('[DISC] Re-running solution training job ' + solutionName);
            solution.submitTrainingJob();
        } else {
            errorMsg = '[DISC] Training already in progress. ' + solutionName;
            gs.warn(errorMsg);
            return {
                error: errorMsg
            };
        }
        status = solution.getLatestVersion().getStatus();
        gs.debug('[DISC] Solution training job final status is ' + status);
        return {
            error: null,
            status: status
        };
    },

    getSolution: function(solutionName) {
        return sn_ml.WorkflowSolutionStore.get(solutionName);
    },

    type: 'IntentDiscoveryIntegrator'
};
