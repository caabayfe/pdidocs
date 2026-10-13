(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var data = request.body.data;
	var modelSysId = data.modelSysId;
	var frequency = data.trainingFrequency;
	var ucm = new PIWBUsecaseModelUtil();
	var modelUpdateResult = ucm.updateModel(modelSysId, data);
	if (modelUpdateResult.status == 'success') {
		var result = ucm.updateModelRetrainingFrequency(modelSysId, frequency);
		if (result.successful) {
		response.setStatus(200);
		response.setBody({model_id: result.model_id});
		} else {
			response.setStatus(500);
			response.setBody({message_key: result.message_key});
		}
	}
	else {
		response.setStatus(500);
		response.setBody({message_key: modelUpdateResult.message_key});
	}
})(request, response);
