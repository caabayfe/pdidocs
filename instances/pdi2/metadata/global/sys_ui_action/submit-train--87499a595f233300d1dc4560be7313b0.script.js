current.triggered_source = "UI";
var validationObj = new MlValidationHelper().preTrainingValidation(current.capability.getRefRecord().getValue("value"), current);
if (validationObj.validation) {
	gs.include('ActionUtils');
	var result = current.insert();
	var capability = current.capability.getRefRecord().getValue("value");
	var au = new ActionUtils();
	au.postInsert(current);
	if (current.active && result != null) {
		new global.MLSolutionDefinitionUtils().trainCapabilitySolDef(current);
	}

	var capabilitiesForMissingEncoderWarning = ['regression_trainer', 'classification_trainer', 'workflow_classification_trainer', 'workflow_regression_trainer'];
	if (capabilitiesForMissingEncoderWarning.indexOf(capability) != -1) {
		if (!JSUtil.nil(validationObj.warningMsg)) {
			gs.addInfoMessage(validationObj.warningMsg);
		}
	}
} else {
    current.setAbortAction(true);
    validationObj.errorMsg ? gs.addErrorMessage(validationObj.errorMsg) : "";
}
