(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var grModel = new GlideRecord('ais_genius_result_configuration_sys_nlu_model_m2m');
	grModel.addQuery('genius_result_configuration', current.genius_result_configuration);
	grModel.orderByDesc('order');
	grModel.setLimit(1);
	grModel.query();
	if (grModel.next()) {
		var model = grModel.getValue('nlu_model');
		try {
			var status = NLUStudioService.getModelStatus(model);
			if (status.publishedVersion == 0) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage('NLU model is not trained/published yet. Please link genius result after model is published'));
			}
		} catch (e) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Failed to get NLU model status'));
		}
	} else {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('NLU model is not specified for genius result configuration'));
	}

})(current, previous);
