(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var allowedSentiment = ['positive', 'negative'];
	var requestData = request.body.data;
	
	if (!requestData || Object.keys(requestData).length == 0 || !requestData['sysId']) {
		var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage("There was not enough logging information included in the payload");
        return error;
	}
	
	var feedbackSentiment = (requestData.feedbackSentiment + '').toLowerCase();
	if (allowedSentiment.indexOf(feedbackSentiment) < 0)
		feedbackSentiment = '';
	
	var gr = new GlideRecord('nlq_query_log');
	gr.addQuery('sys_id', requestData.sysId + '');
	gr.query();
	if (!gr.next()) 
		return new sn_ws_err.BadRequestError('NLQ Log could not be found');
	
	gr.setValue('feedback_sentiment', feedbackSentiment);
	gr.setValue('feedback_problem_category', requestData.feedbackProblemCategory ? requestData.feedbackProblemCategory + '' : '');
	gr.setValue('feedback_detailed', requestData.feedbackDetailed ? requestData.feedbackDetailed + '' : '');
	if (gr.canWrite()) {
		gr.update();
		response.setStatus(200);
	}

})(request, response);
