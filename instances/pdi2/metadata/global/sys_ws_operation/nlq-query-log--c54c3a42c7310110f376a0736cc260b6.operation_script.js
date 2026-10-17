(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var data = [];
	var limit;
	var source;
	if (!request.queryParams.hasOwnProperty('userId'))
        return new sn_ws_err.BadRequestError('Missing user id');
	
	if (request.queryParams.hasOwnProperty('limit'))
		limit = request.queryParams['limit'];
	
	if (!limit || isNaN(limit)) 
		limit = 5;

	if (request.queryParams.hasOwnProperty('source'))
		source = request.queryParams['source'];

	
	var nlqQueryLogRecordGR = new GlideRecordSecure('nlq_query_log');
	nlqQueryLogRecordGR.addQuery('user', request.queryParams['userId']);
	nlqQueryLogRecordGR.addQuery('successful', true);
	if (source)
		nlqQueryLogRecordGR.addQuery('source', source);
	nlqQueryLogRecordGR.orderByDesc('sys_created_on');
	nlqQueryLogRecordGR.query();
	
	while (nlqQueryLogRecordGR.next() && data.length < limit) {
		var utterance = nlqQueryLogRecordGR.getValue('utterance');
		if (data.indexOf(utterance) < 0)
			data.push(utterance);
	}
	response.setBody(data);
	response.setStatus(200);

})(request, response);
