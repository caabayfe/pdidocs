var HR_MLPortalUtilsSNC = Class.create();
HR_MLPortalUtilsSNC.prototype = {
    initialize: function() {},

	/* getRecommendedArticles : Fetches the topN similar Knowledge artciles for a task based on the Machine Learning predictions.The first time when task is loaded , a call is made to ML            prediction server to fetch the similar articles, these results are stored in ml_predictor_results table.Hence when the task is loaded from second time onwards the results are              fetched from ml_predictor_results table
		Parameters: 1) taskId: SysId of the task
					2) tableName: Name of the task table 
					3) knowledgeBases : List of all knowledge bases supported by the portal in which the recommended articles are shown
					4) solution : Solution name of the ML Solution definition
					5) topN : Number of articles to be displayed
	*/
    getRecommendedArticles: function(taskId, tableName, knowledgeBases, solution, topN) {
        var versioningEnabled = GlidePluginManager.isActive('com.snc.knowledge_advanced') && gs.getProperty("glide.knowman.versioning.enabled", "true") === "true";
        var knowledgeArticles = [];
        var count = 0;
        var UserProfileRecommendationUtil = new sn_hr_sp.UserRecommendationUtil();
        var articleDetails = {};
        var task = new GlideRecord(tableName);
        var results = {};
        var predictorResults = new GlideRecord("ml_predictor_results");
        var kbArticle = [];
        var predictedConfidenceTopNValue;
        var predictedConfidenceTopNList = [];
        var predictedOutputArray = [];
        /* get useCase from solution definition */
        var currentDomain;
        var user = new GlideRecord('sys_user');
        var userId = gs.getUserID();
        if (user.get(userId))
            currentDomain = user.sys_domain;

        var useCase = this.fetchUseCaseFromSolutionName(solution, currentDomain);
        if (!useCase) {
            useCase = this.fetchUseCaseFromSolutionName(solution, 'global');
            if (!useCase)
                return;
        }

        /*Get the solution definition from HR AI Configuration */
        var config = this.fetchHRAiConfig(useCase, currentDomain);
        if (!config.next()) {
            config = this.fetchHRAiConfig(useCase, 'global');
            if (!config.next())
                return;
        }

        if (config.solution_capability_definition.active) {
            var solutionGr = new GlideRecord('ml_solution');
            solutionGr.addQuery('solution_name', solution);
            solutionGr.addActiveQuery();
            solutionGr.setLimit(1);
            solutionGr.query();
            if (solutionGr.next()) {
                var thresholdLimit = solutionGr.threshold;
                if (task.get(taskId)) {
                    predictorResults.addQuery('source_sys_id', taskId);
                    predictorResults.addQuery('solution', solutionGr.getUniqueValue());
                    predictorResults.orderByDesc('sys_created_on');
                    predictorResults.setLimit(1);
                    predictorResults.query();
                    if (predictorResults.next()) {
                        if (predictorResults.predicted_confidence < thresholdLimit)
                            return null;
                        predictedConfidenceTopNValue = predictorResults.predicted_confidence_topn;
                        predictedConfidenceTopNList = predictedConfidenceTopNValue.split(',');
                        results = predictorResults.predicted_output_value;
                        predictedOutputArray = results.split(",");
                        for (var i = 0; i < predictedConfidenceTopNList.length; i++) {
                            if (predictedConfidenceTopNList[i] < thresholdLimit)
                                break;
                            kbArticle.push(predictedOutputArray[i]);
                        }
                    } else if (tableName == "sn_ca_campaign_item") {
						try {
                            var mlSolution = sn_ml.MLSolutionFactory.getSolution(solution);
    						var inputs = [{"short_description": String(task.content.title)}];
                            var options = {};
                            options.top_n = topN;
                            options.apply_threshold = true;
                            results = mlSolution.predict(inputs, options);
                            if (gs.nil(results))
                                return null;
                            var resultsJson = JSON.parse(results);
                        } catch (e) {
                            gs.error(e);
                            return null;
                        }
						if (resultsJson) {
    						for(var o in resultsJson) {
    							for(var i in resultsJson[o]) {
    								kbArticle.push(resultsJson[o][i].predictedValue); 
    							}
							}
						}
					} 
					else {
                        try {
                            var mlSolution = sn_ml.SimilaritySolutionStore.get(solution);
                            var options = {};
                            options.top_n = topN;
    						options.mluc = 'MLUC-HR-00005';
                            options.apply_threshold = true;
                            results = mlSolution.getActiveVersion().predict(task, options);
                            if (gs.nil(results))
                                return null;
                            var resultsJson = JSON.parse(results);
                        } catch (e) {
                            gs.error(e);
                            return null;
                        }

                        predictedOutputArray = resultsJson[taskId];
    					if(!gs.nil(predictedOutputArray)) {
	                    for (var j = 0; j < predictedOutputArray.length; j++)
                            kbArticle.push(predictedOutputArray[j].predictedValue);
    					}
                    }
    				if (gs.nil(kbArticle))
                        return null;
                    for (var j = 0; j < kbArticle.length; j++) {
                        articleDetails = {};
                        articleDetails = UserProfileRecommendationUtil.checkAndReturnAccessibleArticle(kbArticle[j], knowledgeBases, versioningEnabled);
                        if (!gs.nil(articleDetails)) {
                            knowledgeArticles.push(articleDetails);
                            ++count;
                            if (count == topN)
                                break;
                        }
                    }
    				return knowledgeArticles;
                } else {
                    gs.error(" Specified Task does not exist ");
                    return null;
                }
            } else {
                gs.warn("Solution GlideRecord does not exist, please train the solution definition.");
                return null;
            }
        } else {
            gs.error("Please provide a solution defintion for similar users in the HR AI Configuration");
            return null;
        }

    },

	/* getSimilarUsers : To get the list of similar users for the logged in user based on similar HR profiles
		Parameters: 1) userId: userId of the logged in user
					2) topN: gets the topN similar users
	*/
    getSimilarUsers: function(userId, topN) {
        var similarUsers = [];
        var profiles = this.getSimilarProfiles(userId, topN);
        if (!gs.nil(profiles)) {
            var userProfile = new GlideRecord('sn_hr_core_profile');
            for (var i = 0; i < profiles.length; i++) {
                if (userProfile.get(profiles[i]))
                    similarUsers.push(userProfile.getValue('user'));
            }
        }
        return similarUsers;
    },

    /* getSimilarProfiles:Gets the similar HR profiles of the logged in user.The first time when user is logged in , a call is made to ML prediction server to fetch the similar profiles,          these results are stored in ml_predictor_results table.Hence when the user is logged in from second time onwards results are fetched from ml_predictor_results table
		Parameters: 1) userId: userId of the logged in user
					2) topN: gets the topN similar HR Profiles
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

        var profile = new GlideRecord('sn_hr_core_profile');
        profile.addQuery('user', userId);
        profile.setLimit(1);
        profile.query();
        if (profile.next()) {
            /*Get the solution definition from HR AI Configuration */
            var config = this.fetchHRAiConfig('similar_users', currentDomain);
            if (!config.next()) {
                config = this.fetchHRAiConfig('similar_users', 'global');
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
                gs.error("Please provide a solution defintion for similar users in the HR AI Configuration");
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
        var mlSolution = sn_ml.SimilaritySolutionStore.get(solution);
        var similarProfiles = [];
        var results = {};
        try {
            var options = {};
			options.mluc = "MLUC-HR-00007";
            if (gs.nil(topN))
                options.top_n = 25;
            else
                options.top_n = topN;
            options.apply_threshold = true;

            results = mlSolution.getActiveVersion().predict(profile, options);
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
	/* fetchHRAiConfig : Returns the HR AI Configuration Record for the use case specified based on domain 
		Parmenters: 1) useCase : Use Case specified in HR AI Confoguration table 
					2) domain : Current domain of the user 
	*/
	
    fetchHRAiConfig: function(useCase, domain) {
        try {
            var hrAIConfiguration = new GlideRecord('sn_hr_core_ai_configuration');
            hrAIConfiguration.addQuery('use_case', useCase);
            hrAIConfiguration.addQuery('sys_domain', domain);
            hrAIConfiguration.addActiveQuery();
            hrAIConfiguration.setLimit(1);
            hrAIConfiguration.query();
            return hrAIConfiguration;
        } catch (err) {
            gs.error('Error in fetching HR AI configuration: ' + err.toString());
        }
    },
    /* fetchUseCaseFromSolutionDefintion : Returns the use case for a specified solution definition based on domain 
    	Parmenters: 1) solution : solution defintion specified in HR AI Confoguration table 
    				2) domain : Current domain of the user 
    */
    fetchUseCaseFromSolutionName: function(solution, domain) {
        try {
            var hrAIConfiguration = new GlideRecord('sn_hr_core_ai_configuration');
            hrAIConfiguration.addQuery('solution_capability_definition.solution_name', solution);
            hrAIConfiguration.addQuery('sys_domain', domain);
            hrAIConfiguration.setLimit(1);
            hrAIConfiguration.addActiveQuery();
            hrAIConfiguration.query();
            hrAIConfiguration.next();
            return hrAIConfiguration.use_case.toString();
        } catch (err) {
            gs.error('Error in fetching useCase from HR AI configuration: ' + err.toString());
        }
    },
    type: 'HR_MLPortalUtilsSNC'
};
