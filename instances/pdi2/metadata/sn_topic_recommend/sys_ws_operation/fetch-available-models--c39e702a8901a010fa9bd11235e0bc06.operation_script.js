(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var models = new sn_topic_recommend.RecommendationUtil().getAvailableModels();
	
	response.setContentType('application/json');
	response.setStatus(200);
	response.setBody(models);

})(request, response);
