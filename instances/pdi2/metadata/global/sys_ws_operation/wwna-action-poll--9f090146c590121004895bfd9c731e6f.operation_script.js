(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const pollId = request.queryParams.poll_id;
	if(!pollId) {
		return sn_ws_err.NotFoundError('poll_id is a required field.');
	}

	const gr = new MobileWWNA().getGenAIResponse({pollId: pollId});

	if(gr.next()) {
		const status = gr.getValue('status');
		switch(status) {
			case 'processing':
				return {
					Status: status,
					RetryAfter: 1
				};
			default:
				const responsePayload = JSON.parse(gr.response_payload);
				return {
					Status: status,
					Message: responsePayload.Message,
					LogId: responsePayload.LogId
				};
		}
	} else {
		return sn_ws_err.NotFoundError('No aynch service request found for poll_id: ' + pollId + '.');
	}

})(request, response);
