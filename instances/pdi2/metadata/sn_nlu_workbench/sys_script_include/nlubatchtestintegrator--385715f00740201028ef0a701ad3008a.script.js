var NLUBatchTestIntegrator = Class.create();

(function() {

    var constants = NLUWorkbenchConstants.constants;
    var trainingMode = NLUWorkbenchConstants.TRAINING_MODE;

    NLUBatchTestIntegrator.addSolution = function(batchTestSetName, isOptimized) {
        gs.info('NLU Batch Test - adding solution : ' + batchTestSetName);
        try {
            var solutionInfo = {
                nluTrainingMode: isOptimized ? trainingMode.TRAIN_OPTIMIZE : trainingMode.ASYNC_BATCH,
                label: batchTestSetName
            };

            var solution = new sn_ml.NLUSolution(solutionInfo, {
                dummyKey: 'dummyValue'
            });
            return sn_ml.NLUSolutionStore.add(solution);
        } catch (e) {
            gs.error('NLU Batch Test - Failed to add solution: ' + e.message);
            return null;
        }
    };

    NLUBatchTestIntegrator.getTrainingMode = function(mlSolutionGr) {
        var mlDefinition = mlSolutionGr.ml_capability_definition;
        var mlProps = mlDefinition && mlDefinition.solution_properties;
        return JSON.parse(mlProps || {}).nluTrainingMode;
    };

    NLUBatchTestIntegrator.isTrainingModeValid = function(mlSolutionGr) {
        try {
            var mode = NLUBatchTestIntegrator.getTrainingMode(mlSolutionGr);
            return [trainingMode.ASYNC_BATCH, trainingMode.TRAIN_OPTIMIZE].indexOf(mode) >= 0;
        } catch (e) {
            return false;
        }
    };

    NLUBatchTestIntegrator.getOptimizeSupportedLanguages = function() {
        try {
            var optimizeSupportMap = {};
            var query = 'query { NLU { supportedLanguages { name, language, releaseFeatures {name, isSupported, nonSupportedVersions}}}}';
            var res = global.NLUParloIntegrator.getCapability(query);
            if (res && res.state === 'success' && !res.errors) {
                var supportedLanguages = (res.data && res.data.NLU && res.data.NLU.supportedLanguages) || [];
                for (var i = 0; i < supportedLanguages.length; i++) {
                    if (supportedLanguages[i].releaseFeatures) {
                        supportedLanguages[i].releaseFeatures.forEach(function(feat) {
                            if ((feat.name || '').toLowerCase() === 'optimize' && feat.isSupported === true) {
                                optimizeSupportMap[supportedLanguages[i].language] = {
                                    nonSupportedVersions: feat.nonSupportedVersions || [],
                                    label: supportedLanguages[i].name
                                };
                            }
                        });
                    }
                }
            }
            return {
                status: 'success',
                optimizeSupportMap: optimizeSupportMap
            };
        } catch (e) {
            return {
                status: 'failure',
                message: gs.getMessage('Error while fetching optimization support')
            };
        }
    };

    /**
     * Will execute batch test with given utterances on modelList
     * utterances: JSON object of format { "utterances": [ { "utterance": "..." }, .... ]
     * modelList: String of format "[[{solutionName:'ScriptnluModel', solutionVersion: 1}]]"
     *
     * Return: 
     * {
     *     status: <success | failure>
     *     solutionName: <>
     *     solutionVersion: <>
     * }
     */
    NLUBatchTestIntegrator.submitTestRun = function(solutionName, trainJson) {
        var output = {
            status: 'failure'
        };
        try {
            if (trainJson && trainJson.solutionInfo && trainJson.payload) {
                var solutionInfo = trainJson.solutionInfo;
                var payload = trainJson.payload;
                gs.info('NlU Batch Test - running : ' + JSON.stringify(solutionInfo));

                var solution = new sn_ml.NLUSolution(solutionInfo, payload);
                sn_ml.NLUSolutionStore.update(solutionName, solution);
                var solutionVersion = solution.submitTrainingJob({});
                if (!solutionVersion) throw new Error('Failed to submit train');

                var solutionStatus = solutionVersion.getStatus();
                if (!solutionStatus) throw new Error('Failed to get the status of train submission');

                solutionStatus = JSON.parse(solutionStatus);
                output.status = solutionStatus.hasJobEnded === 'false' ? 'success' : 'failure';
                output.solutionVersion = solutionVersion && solutionVersion.getVersionNumber();
                output.solutionName = solutionName;
            } else {
                output.message = gs.getMessage('Invalid train json');
            }
        } catch (e) {
            gs.error('Error while submitting batch test run : ' + e.message);
            output.message = e.message;
        }
        gs.info('NlU Batch Test - execution job: ' + JSON.stringify(output));
        return output;
    };

    NLUBatchTestIntegrator.cancelTestRun = function(solutionName) {
        var result = {};
        try {
            var solution = sn_ml.NLUSolutionStore.get(solutionName);
            solution.cancelTrainingJob();
            result.status = 'success';
        } catch (e) {
            gs.debug('NLU Batch Test run cancel error' + e.message);
            result.status = 'failure';
            result.message = e.message;
        }
        return result;
    };

    NLUBatchTestIntegrator.copyArtifacts = function(fromSolutionName, fromSolutionVersion, toSolutionName) {
        var result = {
            status: 'failure'
        };
        try {
            var solution = sn_ml.NLUSolutionStore.get(fromSolutionName, {});
            var solutionVersion = solution.getVersion(fromSolutionVersion);
            if (solutionVersion && solutionVersion.copyArtifacts(toSolutionName)) {
                result.status = 'success';
            }
        } catch (e) {
            gs.debug('NLU Batch Test - Optimization apply failure: ' + e.message);
            result.message = e.message;
        }
        return result;
    };

    /**
     * Will get the results for solutionName, versionNumber
     * 
     * Result: 
     * {
     *     "status": "success",
     *     "response": {
     *         "inferences": [
     *             {
     *                 "utterance": "Jimmy should be added as my emergency contact",
     *                 "intents": [
     *                     {
     *                         "intentName": "AddEmergencyContact",
     *                         "nluModelName": "ScriptnluModel",
     *                         "score": 0.77628595
     *                     }
     *                 ]
     *             },
     *             ...
     *         ]
     *     }
     * }
     */
    NLUBatchTestIntegrator.getTestRunResults = function(solutionName, versionNumber) {
        try {
            var solutionVersion = NLUBatchTestIntegrator.getTestRunSolution(solutionName, versionNumber);

            var solutionVersionProperties = JSON.parse(solutionVersion.getProperties());
            var mode = NLUBatchTestIntegrator.getTrainingMode(
                NLUMLSolutionUtil.getMlGr(solutionName, versionNumber));
            var isOptimizedMode = (mode === trainingMode.TRAIN_OPTIMIZE);

            var testingResults = {};
            var summaryResults = {};
            var optimizedResults = null;
            var optimizedThreshold = {};

            try {
                if (isOptimizedMode) {
                    // getArtifactAsString is support for Rome and above only.
                    testingResults = solutionVersion.getArtifactAsString("current_predictions");

                    var hasValidationErrors = false;
                    var validationSummary = NLUBatchTestIntegrator.getTestsetValidationData(solutionVersion);
                    if (validationSummary.status === 'success') {
                        hasValidationErrors = validationSummary.response.dimensionIssues.some(function(issue) {
                            return issue.type === 'ERROR';
                        });
                    }
                    if (!hasValidationErrors) {
                        optimizedResults = JSON.parse(solutionVersion.getArtifactAsString("optimized_predictions"));
                        var authoringModel = solutionVersionProperties.authoringModel;
                        optimizedThreshold[authoringModel.name] = authoringModel.confidenceThreshold;
                    }
                } else {
                    testingResults = solutionVersion.getBatchTestingResult();
                    summaryResults = JSON.parse(solutionVersion.getBatchThresholdSummaryResult());
                }
            } catch (e) {
                gs.debug('NlU Batch Test - Recommendation or Optimisation not available: ' + e.message);
            }

            return {
                status: 'success',
                testing: JSON.parse(testingResults),
                summary: summaryResults,
                optimzed: optimizedResults,
                optimizedThreshold: optimizedThreshold
            };
        } catch (e) {
            gs.debug('NlU Batch Test - Error while getting results : ' + e.message);
            return {
                status: 'failure',
                message: e.message
            };
        }
    };

    NLUBatchTestIntegrator.getTestRunSolution = function(solutionName, versionNumber) {
        try {
            gs.debug('NlU Batch Test - Getting status for : ' + solutionName + ' (' + versionNumber + ')');
            var solution = sn_ml.NLUSolutionStore.get(solutionName);
            if (!solution) throw new Error('Solution does not exist with given name');

            var solutionVersion = solution.getVersion(versionNumber);
            if (!solutionVersion) throw new Error('Solution version not exist with given version number');

            var solutionStatus = JSON.parse(solutionVersion.getStatus(true));
            if (!solutionStatus || solutionStatus.status === 'failure')
                throw new Error(solutionStatus.message || 'Unable to get solution status');

            // Got the solution, but check if it's complete:
            if (solutionStatus.state !== 'solution_complete') throw new Error('Solution is still in progress');

            return solutionVersion;
        } catch (e) {
            gs.debug('NlU Batch Test - Error while getting status : ' + e.message);
            return {
                status: 'failure',
                message: e.message
            };
        }
    };

    NLUBatchTestIntegrator.getTestsetValidationData = function(solutionVersion) {
        try {
            var validationSummary = solutionVersion.getArtifactAsString("test_data_validation_summary");
            return JSON.parse(validationSummary);
        } catch (e) {
            return {
                status: 'failure',
                message: e.message
            };
        }
    };

    NLUBatchTestIntegrator.prototype = {
        initialize: function() {},
        type: 'NLUBatchTestIntegrator'
    };
})();
