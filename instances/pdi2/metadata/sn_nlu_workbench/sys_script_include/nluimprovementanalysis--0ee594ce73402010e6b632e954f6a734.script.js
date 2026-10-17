var NLUImprovementAnalysis = Class.create();

(function() {

    var constants = {
        DATE_RANGE_QUERIES: {
            '30': 'sys_created_on>javascript:gs.beginningOfLast30Days()',
            '60': 'sys_created_on>javascript:gs.beginningOfLast60Days()',
            '90': 'sys_created_on>javascript:gs.beginningOfLast90Days()',
	    'custom': function(dateRange) {
		return "sys_created_onBETWEENjavascript:gs.dateGenerate('" + dateRange[0] + "','start')@javascript:gs.dateGenerate('" + dateRange[1] + "','end')";
	    }
        },

        ML_CAPABILITY_DEFINITION_CLUSTERING: 'ml_capability_definition_clustering',
        ML_SOLUTION: 'ml_solution',
        OPEN_NLU_PREDICT_INTENT_FEEDBACK: 'open_nlu_predict_intent_feedback',
        GLIDE_NLU_FEEDBACK_SOLUTION_NAME: 'ml_sn_sn_nlu_workbench_global_feedback',
        SOLUTION_COMPLETE: 'solution_complete'
    };
    NLUImprovementAnalysis.prototype = {
        initialize: function() {
            this.solutionName = constants.GLIDE_NLU_FEEDBACK_SOLUTION_NAME;
        },

        getClusteringSolution: function() {
            var result = {};
            try {
                if (gs.nil(this.solutionName) ||
                    !(result.solution = sn_ml.ClusteringSolutionStore.get(this.solutionName)))
                    return null;
            } catch (e) {
                gs.debug('Error in retrieving fuzzy matcher solution: ' + e.message);
                return null;
            }
            return result;
        },

        getStatus: function() {
            var latestSolution = {};
            try {
                if (!this.solutionName) {
                    return {
                        status: 'success'
                    };
                }
                var solutionObj = this.getClusteringSolution();
                if (!solutionObj) {
                    return {
                        status: 'failure',
                        message: gs.getMessage('Solution object not found!')
                    };
                }
                var solution = solutionObj.solution;
                var latestSolutionVersion = solution.getLatestVersion();
                var latestSolutionStatus = JSON.parse(latestSolutionVersion.getStatus());
                if (latestSolutionStatus.hasJobEnded === 'false')
                    latestSolution.state = 'training';
                else if (latestSolutionStatus.state === constants.SOLUTION_COMPLETE)
                    latestSolution.state = 'success';
                else
                    latestSolution.state = 'failure';
                latestSolution.solutionVersion = latestSolutionVersion.getVersionNumber();
                latestSolution.solutionName = this.solutionName;
            } catch (e) {
                gs.debug('Error in fetching status for improvement analysis : ' + e.message);
            }
            return {
                status: 'success',
                solution: latestSolution
            };
        },

        cancel: function() {
            var result = {};
            try {
                var clusteringSolution = this.getClusteringSolution();
                if (!clusteringSolution)
                    throw new Error(gs.getMessage('Solution object not found!'));
                clusteringSolution.solution.cancelTrainingJob();
                result.status = 'success';
            } catch (e) {
                gs.debug('NLU Lookup cancelTraining error' + e.message);
                result.status = 'failure';
                result.message = e.message;
            }
            return result;
        },

        run: function(dateRange) {
	    var dateRangeQuery = Array.isArray(dateRange) ? constants.DATE_RANGE_QUERIES.custom(dateRange) : constants.DATE_RANGE_QUERIES[dateRange];
            var encodedQuery = 'nlu_provider=64c023c17300330021a044764df6a70e^' + dateRangeQuery;
            var fieldNames = ['utterance', 'selected', 'prediction', 'confidence', 'audit_log', 'auto_selected', 'current_intent'];
            try {
                var result = {
                    solution: {}
                };
                var defaults = {
                    dataset: new sn_ml.DatasetDefinition({
                        tableName: constants.OPEN_NLU_PREDICT_INTENT_FEEDBACK,
                        fieldNames: fieldNames,
                        encodedQuery: encodedQuery
                    }),
                    inputFieldNames: ['utterance'],
                    minRowCount: 0,
                    advancedParams: {
                        HDBSCAN: '',
                    },
                    preprocessingPipeline: [{
                        type: 'nlu_feedback_labeling_preprocess',
                        label: 'group and dedup for feedback labeling',
                        fieldNames: fieldNames,
                        option: 'default'
                    }],
                    label: 'feedback'
                };
                var solution = new sn_ml.ClusteringSolution(defaults);
                if (!this.getClusteringSolution()) {
                    sn_ml.ClusteringSolutionStore.add(solution);
                } else sn_ml.ClusteringSolutionStore.update(this.solutionName, solution);

                var solutionVersion = solution.submitTrainingJob();

                var solutionVersionProperties = JSON.parse(solutionVersion.getProperties());
                var solutionStatus = JSON.parse(solutionVersion.getStatus());

                if (solutionStatus.hasJobEnded === 'false')
                    result.solution.state = 'training';
                else if (solutionStatus.state === constants.SOLUTION_COMPLETE)
                    result.solution.state = 'success';
                else
                    result.solution.state = 'failure';
                result.solution.solutionVersion = solutionVersion.getVersionNumber();
                result.solution.solutionName = solutionVersionProperties.name;
                result.status = 'success';
            } catch (e) {
                result.status = 'failure';
                result.message = e.message;
            }

            return result;
        },

        type: 'NLUImprovementAnalysis'
    };
})();
