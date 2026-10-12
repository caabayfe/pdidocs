(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var currentId = request.body.data.currentId; // Change_request id
	var currentTable = request.body.data.currentTable; // Change_request
	var resourceId = request.body.data.resourceId; // Incident id
	var resourceTable = request.body.data.resourceTable; // Incident
	var actionStage = request.body.data.actionStage;
 
	var currentGr = new GlideRecordSecure(currentTable);
	if (!currentGr.get(currentId))
		return response.setBody({successful: false, message: gs.getMessage("Could not find Change Request")});
	
	var resourceGr = new GlideRecordSecure(resourceTable);
	if (!resourceGr.get(resourceId))
		return response.setBody({successful: false, message: gs.getMessage("Could not find Incident")});

	var currentNumber = currentGr.number;
	var resourceNumber = resourceGr.number;

	var body = {};
	if (actionStage === 'pre_modal') {
		body.successful = true;
		body.useModal = true;
		body.modalTitle = gs.getMessage('Link to Incident');
		body.errMsg = gs.getMessage('Could not link Incident to Change Request');
		body.modalInfoMsg = gs.getMessage('Now linking {0} to {1}.', [currentNumber, resourceNumber]);
		body.modalFields = [{label: currentGr.work_notes.getLabel(), name: 'work_notes', value: '', fieldType: 'textarea'}, {label: currentGr.comments.getLabel('comments'), name: 'comments', value: '', fieldType: 'textarea'}];
		body.postModalRestRequired = true;
	} else if (actionStage === 'post_modal') {
		resourceGr.caused_by = currentGr.sys_id;
		resourceGr.update();
		body.successful = true;
		body.infoMsg = gs.getMessage('{0} has been identified as a possible cause for {1}.', [currentNumber, resourceNumber]);
		body.useModal = true;
	} else
		return response.setBody({successful: false, message: gs.getMessage("Invalid action stage")});

	response.setBody(body);

})(request, response);
