var IntentDiscoveryUtilQuebec = Class.create();
IntentDiscoveryUtilQuebec.prototype = {
    initialize: function() {
        this.CLASSIFCATION_ONLY = "classification";
        this.CLUSTERING_ONLY = "clustering";
    },

    createJob: function(sysId, table, field, encodedQuery, extraOpts) {
        try {
            // TODO support for langauge
            // authoringModel required for constructor
            var authoringModel = {
                "schemaVersion": "NY-1",
                "name": sysId,
                "language": "en",
                "version": "2.02",
                "intents": [],
                "entities": [],
            };

            var solutionInfo = {
                "label": sysId,
                "nluTrainingMode": "CoverageReport",
                "datasetProperties": {
                    "tableName": table,
                    "fieldNames": [field]
                },
                "Coverage-Cluster-Lang": "ml",
                "Coverage-Text-Field": field,
                "Coverage-Inlucde-Msg": false,
            };

            if (extraOpts && extraOpts != undefined) {
                Object.keys(extraOpts).forEach(function(key) {
                    // user fields is the only key that can't be placed directly in solution properties.
                    // we need to append it to "field" so that data for these columns are sent to the training server.
                    if (key === "user_fields") {
                        solutionInfo.datasetProperties.fieldNames = [solutionInfo.datasetProperties.fieldNames.concat(extraOpts[key]).join(",")];
                    } else {
                        solutionInfo[key] = extraOpts[key];
                    }
                });
            }

            if (encodedQuery && encodedQuery != null) {
                solutionInfo.datasetProperties.encodedQuery = encodedQuery;
            }

            var nluSolution = new sn_ml.NLUSolution(solutionInfo, authoringModel);
            var solutionName = sn_ml.NLUSolutionStore.add(nluSolution);
            gs.debug("Created solution for Intent Discovery:" + solutionName);
            var solutionVersion = nluSolution.submitTrainingJob();
            var trainingStatus = solutionVersion.getStatus(false);
            gs.debug("props: " + JSON.stringify(solutionVersion.getProperties()));
            return solutionName;
        } catch (e) {
            gs.warn('Error creating report definition:' + e.message + '\n' + e);
        }
    },

    getOptions: function(extraOpts, reportDef) {
        var shouldCluster = reportDef.getValue("cluster_records");
        if (shouldCluster === 0 || shouldCluster === false || shouldCluster === "0") {
            extraOpts["Coverage-Job-Type"] = this.CLASSIFCATION_ONLY;
        } else if (!reportDef.getValue("model")) {
            // Only run clustering for no Taxonomy
            extraOpts["Coverage-Job-Type"] = this.CLUSTERING_ONLY;
        }

        if (reportDef.getValue("model") && reportDef.getValue("model").toLowerCase() == "hr") {
            extraOpts["Coverage-Model-Type"] = "atlas_hr_english";
            extraOpts["Coverage-ML-Model-Type"] = "atlas_hr_ml";
        }

        return extraOpts;
    },

    rerun: function(solutionDefId, solutionDefRec, reportDef) {
        var solutionName = solutionDefRec.getValue('solution_name');

        var solution;
        var status;
        try {
            solution = sn_ml.NLUSolutionStore.get(solutionName);
        } catch (e) {
            var IDUtil = new sn_nlu_discovery.IntentDiscoveryUtil();
            solutionName = IDUtil.createReport(reportDef);
            solution = sn_ml.NLUSolutionStore.get(solutionName);
            if (!gs.nil(solution)) {
                status = solution.getLatestVersion().getStatus();
                gs.debug('[DISC] Re-running solution training job ' + solutionName);
                return {
                    error: null,
                    status: status
                };
            }
        }
        var errorMsg;
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
        return sn_ml.NLUSolutionStore.get(solutionName);
    },

    type: 'IntentDiscoveryUtilQuebec'
};
