(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	// AI Search Assist does not currently support custom actions. This is for internal use only.
	
	var data = request.body.data;
	var className = data.className;
	var table = data.table;
	var sysId = data.sysId;
	var feedbackData = data.feedbackData;

	var result = {};
	var isModalSubmit = data.isModalSubmit;
	
	if (!isModalSubmit) {
		result = {
			actionType: 'OPEN_MODAL',
			modalBodyTemplate: 'aisa-am-resolves-' + table,
			modalTitle: gs.getMessage('Solves my issue?'),
			modalSubmitText: gs.getMessage('Confirm'),
			// modalData is for custom usage of modal
			modalData: {}
		};
	} else {
		result = {
			actionType: 'SEARCH_RESULT_EVENT_SIGNAL',
			signalType: 'SOLVES_ISSUE',
			signalValue: 1
		};
	}
	response.setBody(result);
	
})(request, response);
