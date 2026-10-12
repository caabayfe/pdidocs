(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var userId = request.pathParams.userId;
	var preferencesTable = 'sys_cb_user_preference';

	function setUserPreference(userId, preference) {
		var gr = new GlideRecord(preferencesTable);
		gr.addQuery('user', userId);
		gr.addQuery('preference', preference.name);
		gr.query();

		if (!gr.next()) {
			gr.newRecord();
			gr.setValue('user', userId);
			gr.setValue('preference', preference.name);
		}

		gr.setValue('value', preference.value);
		return (gr.isNewRecord() ? gr.insert() : gr.update());
	}

	response.setBody({
		user: userId,
		result: setUserPreference(userId, request.body.data)
	});
	response.setStatus(200);
	response.setContentType('application/json');

})(request, response);
