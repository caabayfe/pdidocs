var NLULookupIntegrator = Class.create();

(function() {

    var vocabTypes = NLUConstants.VOCAB_TYPES;
    var constants = NLUConstants.constants;

    NLULookupIntegrator.prototype = {
        initialize: function(lookupGR) {
            this.lookupGR = lookupGR;
        },

        train: function(lookupTrainData, solutionOptions, options) {
            var output = {
                lookupDetails: {}
            };
            try {
                var lookupTrainDataStr = JSON.stringify(lookupTrainData);
                gs.debug('NLULookupIntegrator trainJson: ' + lookupTrainDataStr);
                var fuzzyMatcherSolution = this.getFuzzyMatcherSolution();
                if (!fuzzyMatcherSolution)
                    fuzzyMatcherSolution = this.createLookupSolution();

                var solutionInfo = {
                    label: fuzzyMatcherSolution.solutionName
                };

                if (solutionOptions && !gs.nil(solutionOptions.trainingFrequency))
                    solutionInfo.trainingFrequency = solutionOptions.trainingFrequency;

                var updatedFuzzyMatcherSolution = new sn_ml.FuzzyMatcherSolution(solutionInfo, JSON.parse(lookupTrainDataStr));
                sn_ml.FuzzyMatcherSolutionStore.update(fuzzyMatcherSolution.solutionName, updatedFuzzyMatcherSolution, options);

                var async = this.lookupGR.getValue('type') === vocabTypes.lookup ? true : false;
                var trainingOptions = async ?{}: {
                    trainingMode: 'sync'
                };

                if (options && typeof options === 'object') {
                    trainingOptions = NLUHelper.extend(trainingOptions, options);
                }

                var solutionVersion = updatedFuzzyMatcherSolution.submitTrainingJob(trainingOptions);
                var solutionStatus = JSON.parse(solutionVersion.getStatus());

                if (async) {
                    if (solutionStatus.hasJobEnded === 'false') {
                        output.status = 'success';
                        output.lookupDetails.state = solutionStatus.state;
                    } else
                        output.lookupDetails.state = output.status = 'failure';
                } else {
                    output.lookupDetails.state = output.status = solutionStatus.state === constants.SOLUTION_COMPLETE ? 'success' : 'failure';
                }

                this.updateSolutionName(fuzzyMatcherSolution.solutionName);

                output.lookupDetails.solutionVersion = solutionVersion.getVersionNumber();
                output.lookupDetails.solutionName = this.lookupGR.getValue('solution_name');
                output.lookupDetails.handleName = this.lookupGR.getValue('name');

            } catch (e) {
                output.status = 'failure';
                output.message = e.message;
            }
            gs.debug('Nlu Lookup training response: ' + JSON.stringify(output));
            return output;
        },

        cancelTraining: function() {
            var result = {};
            try {
                var fuzzyMatcherSolution = this.getFuzzyMatcherSolution();
                if (!fuzzyMatcherSolution)
                    throw new Error(gs.getMessage('Solution object not found!'));
                fuzzyMatcherSolution.solution.cancelTrainingJob();
                result.status = 'success';
            } catch (e) {
                gs.debug('NLU Lookup cancelTraining error' + e.message);
                result.status = 'failure';
                result.message = e.message;
            }
            return result;
        },

        getModelVersion: function(language) {
            var fuzzyMatcherSolution = this.getFuzzyMatcherSolution();
            if (!fuzzyMatcherSolution)
                fuzzyMatcherSolution = this.createLookupSolution();

            var output = JSON.parse(fuzzyMatcherSolution.solution.getModelVersion(language));
            return output.response.version;
        },

        createLookupSolution: function() {
            var solution = new sn_ml.FuzzyMatcherSolution({
                "label": this.lookupGR.getUniqueValue()
            }, {
                dummyKey: 'dummyValue'
            });
            var solutionName = sn_ml.FuzzyMatcherSolutionStore.add(solution);
            return {
                solutionName: solutionName,
                solution: solution
            };
        },

        updateSolutionName: function(solutionName){
            this.lookupGR.setValue('solution_name', solutionName);
            this.lookupGR.update();
        },

        getFuzzyMatcherSolution: function() {
            var result = {};
            try {
                if (gs.nil(result.solutionName = this.lookupGR.getValue('solution_name')) ||
                    !(result.solution = sn_ml.FuzzyMatcherSolutionStore.get(result.solutionName)))
                    return null;
            } catch (e) {
                gs.debug('Error in retrieving fuzzy matcher solution: ' + e.message);
                return null;
            }
            return result;
        },

        getModelStatus: function() {
            var solutionName = '';
            var latestSolution = {};
            var activeSolution = {};
            try {
                var solutionObj = this.getFuzzyMatcherSolution();
                if (!solutionObj) {
                    return {
                        status: 'failure',
                        message: gs.getMessage('Solution object not found!')
                    };
                }
                solutionName = solutionObj.solutionName;
                var solution = solutionObj.solution;
                var latestSolutionVersion = solution.getLatestVersion();
                var latestSolutionStatus = JSON.parse(latestSolutionVersion.getStatus());
                latestSolution.state = latestSolutionStatus.state;
                latestSolution.version = latestSolutionVersion.getVersionNumber();
                var activeSolutionVersion = solution.getActiveVersion();
                var activeSolutionProperties = JSON.parse(activeSolutionVersion.getProperties());
                activeSolution.version = activeSolutionVersion.getVersionNumber();
                var lastSyncedDate = new GlideDateTime(activeSolutionProperties['sys_updated_on']);
                activeSolution.lastSyncedDate = {
                    value: lastSyncedDate.getValue(),
                    displayValue: lastSyncedDate.getDisplayValue()
                };
            } catch (e) {
                gs.debug('NLU Lookup getModelStatus error : ' + e.message);
            }
            return {
                status: 'success',
                solutionName: solutionName,
                activeSolution: activeSolution,
                latestSolution: latestSolution
            };
        },

        getLastTrainedVersion: function() {
            var solution = this.getFuzzyMatcherSolution();
            return solution && NLUParloIntegrator.getLastTrainedVersion(solution.solution);
        },

        type: 'NLULookupIntegrator'
    };
})();
