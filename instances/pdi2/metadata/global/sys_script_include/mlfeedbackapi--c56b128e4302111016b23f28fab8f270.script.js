var MLFeedbackAPI = Class.create();
MLFeedbackAPI.prototype = {

    FEEDBACK_BATCHSIZE: parseInt(gs.getProperty('sn_ml.feedback_insert.batchsize', 100)),
    FEEDBACK_RETRIEVAL_LIMIT: parseInt(gs.getProperty('sn_ml.feedback_retrieve.batchsize', 100)),

    initialize: function() {
    },
	
	
    /*
	Exposes method to save feedback whether individually or in bulk
	@param feedback, mlSolutionId are required 
	@return saved feedback response record containing sysId or list of sysIds
    */
    saveFeedback: function(feedback, mlSolutionId, sourceTable, sourceSysId, predictionSysId, predictionInput, predictionTable) {
		
        if (!feedback)
            new Error('A feedback object is mandatory in order perform any operation using the feedback api. Feedback argument is either a feedback object or an array of feedback object');
		
        if (!mlSolutionId)
            new Error('A reference to ML solution is mandatory in order perform any operation using the feedback api.');

        var normalizedFeedbackJSON = {
            'language_x_solution': mlSolutionId ? mlSolutionId : '',
            'source_table': sourceTable ? sourceTable : '',
            'source_sys_id': sourceSysId ? sourceSysId : '',
            'prediction_input': predictionInput ? predictionInput : '',
            'prediction_table': predictionTable ? predictionTable : '',
            'prediction_id': predictionSysId ? predictionSysId : ''
        };

        if (Array.isArray(feedback))
            return this._saveBulkFeedback(normalizedFeedbackJSON, feedback);
        else {
            normalizedFeedbackJSON['prediction_feedback'] = JSON.stringify(feedback);
			var columnValueString = JSON.stringify(normalizedFeedbackJSON);
            return sn_ml.MLFeedbackService.saveFeedback(columnValueString);
			
        }
    },

    _saveBulkFeedback: function(normFbJSON, feedback) {
        var feedbackList = [];
        var feedbackResponse = [];

        for (var i = 0; i < feedback.length; i++) {
            if (feedbackList.length == this.FEEDBACK_BATCHSIZE) {
                var response = sn_ml.MLFeedbackService.saveBulkFeedback(JSON.stringify(feedbackList));
                feedbackResponse.push(response);
                feedbackList = [];
            }
        
            var localJSON = JSON.parse(JSON.stringify(normFbJSON));
            localJSON['prediction_feedback'] = feedback[i];
            feedbackList.push(localJSON);
        }

        if (feedbackList.length > 0)
            feedbackResponse.push(sn_ml.MLFeedbackService.saveBulkFeedback(JSON.stringify(feedbackList)));
		
        return JSON.stringify(feedbackResponse);
    },


    /*
	Exposes method to update feedback individually using feedback sys_id
	@param feedback sys_id, columnValueMap (object containing fields to update in the feedback table) 
	@return feedback response record containing sysId of updated feedback
    */
    updateFeedbackById: function(feedbackId, columnValueMap) {
        return sn_ml.MLFeedbackService.updateFeedback(feedbackId, JSON.stringify(columnValueMap));
    },

	
    /*
	Exposes method to mark feedback for deletion individually by sys_id
	@param feedback sys_id
	@return feedback response record containing sysId of updated feedback
    */
    markFeedbackForDeletionById: function(feedbackId) {
        var columnValueMap = {
            'active' : false
        };

        return sn_ml.MLFeedbackService.updateFeedback(feedbackId, JSON.stringify(columnValueMap));
    },

	
    /*
	Exposes method to mark feedback for deletion in bulk using an encoded query string
	@param queryString e.g source_sys_id=cfdb24624302111018b43f28fab8f277
	@return list of feedback response record containing sysIds marked for deletion
    */
    markFeedbackForDeletionByQuery: function(queryString) {
        var columnValueMap = {
            'active' : false
        };
		
        return sn_ml.MLFeedbackService.updateBulkFeedback(queryString, JSON.stringify(columnValueMap));
    },
	

    /*
	Exposes method to retrieve feedback using feedback sys_id
	@param feedbackId
	@return feedback record
    */
    retrieveFeedbackById: function(feedbackId) {
        var fbGr = new GlideRecord(MLBaseConstants.FEEDBACK_TABLE);
        fbGr.get(feedbackId);
        if (!fbGr.isValidRecord())
            throw new Error('Feedback sys id provided does not match any feedback records');

        if (fbGr.getValue('active') == 0)
            throw new Error('Feedback sys id provided is marked for deletion and is not active.');


        return this._constructFeedbackJSON(fbGr);
    },


    /*
	Exposes method to retrieve a list feedback using a query, this method sets the query, works in conjunction with the nextSet() method
	@param queryString e.g source_sys_id=cfdb24624302111018b43f28fab8f277
		
    */
    setFeedbackQuery: function(queryString) {
        this.queryString = queryString;
        this.currentWindow = 0;
    },

	
    /*
	Exposes method to retrieve a list of feedback if available, works with the setFeedbackQuery method
	@param 
	@return list of feedback records
    */
    nextSet: function() {
        if (!this.queryString)
            throw new Error('Set feedback query in order to retrieve feedback matching the query.');
		
        var feedbackList = [];
        var nextRecordSetGr = this._nextWindowGr();
        while (nextRecordSetGr.next())
            feedbackList.push(this._constructFeedbackJSON(nextRecordSetGr));

        return feedbackList;
    },

    _nextWindowGr: function(setWindow) {		
        this.feedbackGr = new GlideRecord(MLBaseConstants.FEEDBACK_TABLE);
        this.feedbackGr.addActiveQuery();
        this.feedbackGr.addEncodedQuery(this.queryString);
        this.feedbackGr.orderByDesc('sys_created_on');
        this.feedbackGr.chooseWindow(this.currentWindow, this.currentWindow + this.FEEDBACK_RETRIEVAL_LIMIT);
        this.feedbackGr.query();
		
        if (!setWindow) 
            this.currentWindow = this.currentWindow + this.FEEDBACK_RETRIEVAL_LIMIT;
		
        return this.feedbackGr;
    },


    /*
		Exposes method to check if there is next batch when querying for a list of feedback if available, works with the setFeedbackQuery method
		@param 
		@return true or false based on if there is a next batch of records
    */
    hasNextSet: function() {
        var nextRecordSetGr = this._nextWindowGr(true);
        return nextRecordSetGr.hasNext();
    },

    _constructFeedbackJSON: function(feedbackGr) {
        var fbJSON = {
            'language_x_solution': feedbackGr.getValue('language_x_solution'),
            'source_table': feedbackGr.getValue('source_table'),
            'source_sys_id': feedbackGr.getValue('source_sys_id'),
            'prediction_input': feedbackGr.getValue('prediction_input'),
            'prediction_table': feedbackGr.getValue('prediction_table'),
            'sys_domain': feedbackGr.getValue('sys_domain'),
            'prediction_feedback': feedbackGr.getValue('prediction_feedback'),
            'sys_id': feedbackGr.getUniqueValue(),
            'prediction_id': feedbackGr.getValue('prediction_id')
        };

        return fbJSON;
    },

    type: 'MLFeedbackAPI'
};
