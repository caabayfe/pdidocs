(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var body = request.body.data;

	if (!body || !body.shortcut || !body.platform) {
		response.setError(new sn_ws_err.BadRequestError('Request body must include "shortcut" and "platform"'));
		return;
	}

	var count = 2;
	if(body.count) {
		count = body.count;
	}

	var result;
	try {
		var recommender = new global.UXKeyboardShortcutAIRecommender();
		result = recommender.recommend(body.shortcut, body.platform, count, body.shortcutName || '');
	} catch (e) {
		response.setError(new sn_ws_err.BadRequestError(e + ''));
		return;
	}

	response.setContentType('application/json');
	response.setStatus(200);
	response.setBody(result);
})(request, response);
