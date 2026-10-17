var validationObj = new MlValidationHelper().preTrainingValidation(current.capability.getRefRecord().getValue("value"), current);
if (!validationObj.validation){
	current.setAbortAction(true);
	validationObj.errorMsg ? gs.addErrorMessage(validationObj.errorMsg) : "";
} else {
	action.setRedirectURL(current);
	var result = current.insert();
	gs.include('ActionUtils');
	var au = new ActionUtils();
	au.postInsert(current);
	
	var capabilitiesForMissingEncoderWarning = ['regression_trainer', 'classification_trainer'];
	var capability = current.capability.getRefRecord().getValue("value");
	if(capabilitiesForMissingEncoderWarning.indexOf(capability) != -1) {
		if (!JSUtil.nil(validationObj.warningMsg)) {
			gs.addInfoMessage(validationObj.warningMsg);
		}
	}
	
	if (current.active && result != null) {
		new global.MLSolutionDefinitionUtils().trainCapabilitySolDef(current);
	}
}
