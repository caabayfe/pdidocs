current.triggered_source = "UI";
var validationObj = new MlValidationHelper().preTrainingValidation(current.capability.getRefRecord().getValue("value"), current);
if (!validationObj.validation) {
    current.setAbortAction(true);
    validationObj.errorMsg ? gs.addErrorMessage(validationObj.errorMsg) : "";
} else {
    current.setValue('active', true);
    var result = current.update();
	
	var capability = current.capability.getRefRecord().getValue("value");
	var capabilitiesForMissingEncoderWarning = ['regression_trainer', 'classification_trainer', 'workflow_classification_trainer', 'workflow_regression_trainer'];
	if (capabilitiesForMissingEncoderWarning.indexOf(capability) != -1) {
		if (!JSUtil.nil(validationObj.warningMsg)) {
			gs.addInfoMessage(validationObj.warningMsg);
		}
	}

    if (result != null) {
        new global.MLSolutionDefinitionUtils().trainCapabilitySolDef(current);
    }
}
