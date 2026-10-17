(function executeRule(current, previous /*null when async*/) {

	if (current.solution_parameters.getRefRecord().getValue('key') !== 'Threshold'){
		return;
	}
	
	try {
		performValidations(current);
	} catch (error) {
		gs.addErrorMessage(error);
		current.setAbortAction(true);
	} 
	
	function performValidations(current) {
		var threshold_value = current.getValue('user_inputs');
		var validation_obj = new MlValidationHelper().targetSolThresholdValidation(threshold_value);
		if ( !validation_obj.validation) {
			throw (validation_obj.errorMsg);
		}
		
	}

})(current, previous);
