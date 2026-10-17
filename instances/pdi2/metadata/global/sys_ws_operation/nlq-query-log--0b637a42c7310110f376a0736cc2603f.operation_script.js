(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var NEGATIVE_SENTIMENT = 'Negative';
	var POSITIVE_SENTIMENT = 'Positive';
	var requestData = request.body.data;
	
	if (!requestData || Object.keys(requestData).length == 0 || !requestData['sysId']) {
		var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage("There was not enough logging information included in the payload");
        return error;
	}
	
	var feedbackSentiment = requestData.feedbackSentiment + '';
	if (POSITIVE_SENTIMENT != feedbackSentiment && NEGATIVE_SENTIMENT != feedbackSentiment)
		feedbackSentiment = '';
	
	var gr = new GlideRecordSecure('nlq_query_log');
	gr.addQuery('sys_id', requestData.sysId + '');
	gr.addQuery('user', gs.getUserID());
	gr.query();
	if (!gr.next()) 
		return new sn_ws_err.BadRequestError('NLQ Log could not be found or is not from the user logged in');
	
	gr.setValue('feedback_sentiment', feedbackSentiment);
	gr.setValue('feedback_problem_category', requestData.feedbackProblemCategory ? requestData.feedbackProblemCategory + '' : '');
	gr.setValue('feedback_detailed', requestData.feedbackDetailed ? requestData.feedbackDetailed + '' : '');
	gr.update();
    response.setStatus(200);

})(request, response);
