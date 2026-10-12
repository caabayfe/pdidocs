var EP_MLPortalUtilsSNC = Class.create();
EP_MLPortalUtilsSNC.prototype = {
    initialize: function() {},


	/* getSimilarUsers : To get the list of similar users for the logged in user based on similar Employee profiles
		Parameters: 1) userId: userId of the logged in user
					2) topN: gets the topN similar users
	*/
    getSimilarUsers: function(userId, topN) {
        var similarUsers = [];
        var profiles = this.getSimilarProfiles(userId, topN);
        if (!gs.nil(profiles)) {
            var userProfile = new GlideRecord('sn_employee_profile'); 
            for (var i = 0; i < profiles.length; i++) {
                if (userProfile.get(profiles[i]))
                    similarUsers.push(userProfile.getValue('user'));
            }
        }
        return similarUsers;
    },

    /* getSimilarProfiles:Gets the similar Employee profiles of the logged in user.The first time when user is logged in , a call is made to ML prediction server to fetch the similar profiles, these results are stored in ml_predictor_results table.Hence when the user is logged in from second time onwards results are fetched from ml_predictor_results table
		Parameters: 1) userId: userId of the logged in user
					2) topN: gets the topN similar Employee Profiles
	*/

    getSimilarProfiles: function(userId, topN) {
        var predictedConfidenceTopNValue;
        var predictedConfidenceTopNList = [];
        var predictedOutputArray = [];
        var similarProfiles = [];
        var results = {};
        var currentDomain;
        var user = new GlideRecord('sys_user');
        if (user.get(userId))
            currentDomain = user.sys_domain;

        var profile = new GlideRecord('sn_employee_profile');
        profile.addQuery('user', userId);
        profile.setLimit(1);
        profile.query();
        if (profile.next()) {
            /*Get the solution definition from EP AI Configuration */
            var config = this.fetchEPAiConfig('similar_users', currentDomain);
            if (!config.next()) {
                config = this.fetchEPAiConfig('similar_users', 'global');
                if (!config.next())
                    return;
            }
            if (config.solution_capability_definition.active) {
                var solution = config.solution_capability_definition.solution_name;
                var solutionGr = new GlideRecord('ml_solution');
                solutionGr.addQuery('solution_name', solution);
                solutionGr.addActiveQuery();
                solutionGr.setLimit(1);
                solutionGr.query();
                if (solutionGr.next()) {
                    var thresholdLimit = solutionGr.threshold;
                    var predictorResults = new GlideRecord('ml_predictor_results');
                    predictorResults.addQuery('source_sys_id', profile.getUniqueValue());
                    predictorResults.addQuery('solution', solutionGr.getUniqueValue());
                    predictorResults.orderByDesc('sys_created_on');
                    predictorResults.setLimit(1);
                    predictorResults.query();
                    if (predictorResults.next()) {
						/* If the predicted confidence of the  ML result is less than the threshold limit set for the solution return null*/
                        if (predictorResults.predicted_confidence < thresholdLimit)
                            return null;
                        /*If ML Predictor table has the latest solution only then query the ML predictor else repredict the value for the latest results */
                        if (predictorResults.solution.version == config.solution_capability_definition.current_solution_version) {
                            predictedConfidenceTopNValue = predictorResults.predicted_confidence_topn;
                            predictedConfidenceTopNList = predictedConfidenceTopNValue.split(',');
                            results = predictorResults.predicted_output_value;
                            predictedOutputArray = results.split(",");
                            for (var i = 0; i < predictedConfidenceTopNList.length; i++) {
                                if (predictedConfidenceTopNList[i] < thresholdLimit)
                                    break;
                                similarProfiles.push(predictedOutputArray[i]);
                            }
                            return similarProfiles;
                        } else {
                            return this.predictSimilarProfiles(profile, solution, topN);
                        }
                    } else {
                        return this.predictSimilarProfiles(profile, solution, topN);
                    }
                } else {
                    gs.warn("Solution GlideRecord does not exist, please train the solution definition.");
                    return null;
                }
            } else {
                gs.warn("Please provide a solution defintion for similar users in the EP AI Configuration");
                return null;
            }
        } else
            return null;

    },
	
	/* predictSimilarProfiles: Returns the similar profiles of a HR Profile based on ML prediction 
		Parameters: 1) profile: HR Profile Record for which the similar records need to be fetched
					2) solution : Name of the solution of the corresponding ML solution definition defined for fetching similar HR Profiles
					2) topN: gets the topN similar profiles
	*/
			
    predictSimilarProfiles: function(profile, solution, topN) {
        var mlSolution = sn_ml.MLSolutionFactory.getSolution(solution);
        var similarProfiles = [];
        var results = {};
        try {
            var options = {};
            if (gs.nil(topN))
                options.top_n = 25;
            else
                options.top_n = topN;
            options.apply_threshold = true;
            options.mluc = "MLUC-EX-00001";

            results = mlSolution.predict(profile, options);
            var resultsJson = JSON.parse(results);

        } catch (e) {
            gs.error(e);
            return null;
        }
        var pedictedResults = resultsJson[profile.getUniqueValue()];
		if(!gs.nil(pedictedResults)) {
        for (var i = 0; i < pedictedResults.length; i++)
            similarProfiles.push(pedictedResults[i].predictedValue);
		}

        return similarProfiles;
    },
	/* fetchEPAiConfig : Returns the EP AI Configuration Record for the use case specified based on domain 
		Parmenters: 1) useCase : Use Case specified in EP AI Confoguration table 
					2) domain : Current domain of the user 
	*/
	
    fetchEPAiConfig: function(useCase, domain) {
        try {
            var epAIConfiguration = new GlideRecord('sn_employee_ai_configuration');
            epAIConfiguration.addQuery('use_case', useCase);
            epAIConfiguration.addQuery('sys_domain', domain);
            epAIConfiguration.setLimit(1);
            epAIConfiguration.query();
            return epAIConfiguration;
        } catch (err) {
            gs.error('Error in fetching EP AI configuration: ' + err.toString());
        }
    },

    type: 'EP_MLPortalUtilsSNC'
};
