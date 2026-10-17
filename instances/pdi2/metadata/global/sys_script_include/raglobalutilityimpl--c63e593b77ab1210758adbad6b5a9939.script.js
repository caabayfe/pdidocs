var RAGlobalUtilityImpl = Class.create();
RAGlobalUtilityImpl.prototype = {
    initialize: function() {},
    /**
     * Acquires a mutex lock and retrieves or creates a context.
     * 
     * This method ensures thread safety through mutex locking when accessing or creating 
     * context. The lock prevents race conditions that could occur when multiple 
     * threads attempt to check for an existing context and create one simultaneously.
     * 
     */
    findOrCreateContext: function(currentRecord, ruleContextId, contextInputs) {
        var nbaService = new sn_nb_action.NextBestActionService();
        var contextRecord;
        var ra_mutex = currentRecord.getUniqueValue().toString() + ruleContextId.toString() + gs.getUserID().toString();
        var mutex = new Mutex(ra_mutex, ra_mutex + "_metric");
        mutex.setMaxSpins(100);
        mutex.setSpinWait(300); //30 sec max wait time.
        if (mutex.get()) {
            try {
                contextRecord = nbaService.findOrCreateContext(currentRecord, ruleContextId, contextInputs);
            } finally {
                mutex.release();
            }
        }
        return contextRecord;
    },
    /**
     * Acquires a mutex lock, impersonates a user, and generates recommendations.
     * This method ensures thread safety through mutex locking when generating 
     * recommendations while operating under the impersonated user's context.
     * The lock prevents concurrent access issues when multiple threads attempt
     * to generate recommendations simultaneously.
     */
    generateRecommendationsForUser: function(recommendationParams, response, userId) {
        var shouldImpersonateUser = true;
        // In sync scenarios, userId will be null, which sets shouldImpersonateUser to false
        // This prevents unnecessary impersonation since sync recommendation generation already executes in the context of a user session
        if (userId === '') {
            shouldImpersonateUser = false;
        }
        var ra_mutex_nba = "nbaService_" + recommendationParams.contextRecord.getUniqueValue().toString();
        var mutex = new Mutex(ra_mutex_nba, ra_mutex_nba + "_metric");
        mutex.setMaxSpins(100);
        mutex.setSpinWait(300); //30 sec max wait time.
        if (mutex.get()) {
            try {
                var nbaService = new sn_nb_action.NextBestActionService();
	        var raExecutionContextId = recommendationParams.contextRecord.getUniqueValue();
                var raExecutionContextRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
	    
                if (shouldImpersonateUser) {
                    //Async evaluation
                    var impUser = gs.getSession().impersonate(userId);
                    impUser.impersonate(userId);

                    raExecutionContextRecord.get(raExecutionContextId);
                    raExecutionContextRecord.setValue(sn_nb_action.Constants.COL_EVALUATION_STATUS, sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.RUNNING);
                    raExecutionContextRecord.update();

                    response = nbaService.generateRecommendations(recommendationParams, response ,true); //pass skipStaleCheck as true

                    raExecutionContextRecord.get(raExecutionContextId);
                    if (raExecutionContextRecord.getValue(sn_nb_action.Constants.COL_EVALUATION_STATUS) === sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.WAITING) {
                        response.evaluationStatus = sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.WAITING;
                    } else if (raExecutionContextRecord.getValue(sn_nb_action.Constants.COL_EVALUATION_STATUS) === sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.REFRESH_REQUESTED) {
                        response.evaluationStatus = sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.REFRESH_REQUESTED;
		    } else {
                        response.evaluationStatus = sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.COMPLETED;
                        raExecutionContextRecord.setValue(sn_nb_action.Constants.COL_EVALUATION_STATUS, sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.COMPLETED);
                    }
                    raExecutionContextRecord.setValue(sn_nb_action.Constants.COL_RECOMMENDATION_OUTPUT, JSON.stringify(response));
                    raExecutionContextRecord.setValue(sn_nb_action.Constants.COL_REFRESHED_ON, new GlideDateTime());
                    raExecutionContextRecord.update();

                    gs.getSession().impersonate(impUser);
                } else {
                    response = nbaService.generateRecommendations(recommendationParams, response);
	    	    raExecutionContextRecord.get(raExecutionContextId);
		    if (raExecutionContextRecord.getValue(sn_nb_action.Constants.COL_EVALUATION_STATUS) === sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.REFRESH_REQUESTED) {
			raExecutionContextRecord.setValue(sn_nb_action.Constants.COL_EVALUATION_STATUS, sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.COMPLETED);
			raExecutionContextRecord.update();
		    }
                }
            } catch (error) {
                gs.error('Failed to generate recommendations for Recommendation Action context ' + recommendationParams.contextRecord.getUniqueValue() + " for user " + userId + " - " + error);
            } finally {
                mutex.release();
            }
        } else {
            gs.log('Unable to acquire mutex for recommendation generation: ' + ra_mutex_nba);
        }
        return response;
    },

    updateRAContextEvaluationStatusAsUser: function(userId, raExecutionContextRecord, evaluationStatus) {
        var prevUserId = gs.getSession().impersonate(userId);
        raExecutionContextRecord.setValue(sn_nb_action.Constants.COL_EVALUATION_STATUS, evaluationStatus);
        raExecutionContextRecord.update();
        gs.getSession().impersonate(prevUserId);
    },

	/**
	 * This method can be used by different BUs to implement pre-fetching of recommendations in their respective workspaces.
	 * They have to create one early-eval data broker and call this method inside it.
	 */
    preFetchRecommendations: function(param) {
        var currentRecordTable = param.table;
        var currentRecordSysId = param.sysId;
        var recommendationType = param.recommendationType;
        var forceRefresh = param.forceRefresh;
        var fields = param.fields;
        var ruleContextId = param.contextSysId;
        var shouldGroup = true == param.grouping;
        var contextInputs = param.contextInputs;
        var forceSyncRetry = false;

        if (currentRecordSysId == "-1") return []; // preFetching for new cases/incidents is not allowed

        if (!this.isValidString(currentRecordSysId) || !this.isValidString(currentRecordTable) || !this.isValidString(recommendationType)) {
            gs.error("Invalid params passed to Prefetch Recommendations");
            return [];
        }

        try {
            var nbaService = new sn_nb_action.NextBestActionService();
            var result = nbaService.getRecommendations(currentRecordTable, currentRecordSysId, recommendationType, forceRefresh, fields, shouldGroup, ruleContextId, forceSyncRetry, contextInputs);
            return result ? result : [];
        } catch (err) {
            gs.error("Prefetch Recommendations failed with error : " + JSON.stringify(err));
            return [];
        }
    },

	isValidString: function(str) {
        return str && !gs.nil(str);
    },

    type: 'RAGlobalUtilityImpl'
};
