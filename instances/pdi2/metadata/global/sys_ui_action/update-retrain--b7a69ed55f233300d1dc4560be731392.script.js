current.triggered_source = "UI";
if(current.solution_name.includes("application_suggestion")){
	current.setAbortAction(true); 
	gs.addErrorMessage(gs.getMessage("Retraining is not allowed for application suggestion clustering solutions"));
}
var validationObj = new MlValidationHelper().preTrainingValidation(current.capability.getRefRecord().getValue("value"), current);
if (!validationObj.validation) {
    current.setAbortAction(true);
    validationObj.errorMsg ? gs.addErrorMessage(validationObj.errorMsg) : "";
} else {
    var result = "1"; // Initializing to check if any changes in record
    var capability = current.capability.getRefRecord().getValue("value");
    if (capability == "workflow_classification_trainer" || capability == "workflow_regression_trainer" || capability == "workflow_clustering_trainer" || capability == "workflow_similarity_trainer")
        current.setValue("solution_properties", "");
    result = current.update(); //Returns sys_id. Update returns null if no updates or if Update fails

    var capabilitiesForMissingEncoderWarning = ['regression_trainer', 'classification_trainer', 'workflow_classification_trainer', 'workflow_regression_trainer'];
    var capability = current.capability.getRefRecord().getValue("value");
    if (capabilitiesForMissingEncoderWarning.indexOf(capability) != -1) {
        if (!JSUtil.nil(validationObj.warningMsg)) {
            gs.addInfoMessage(validationObj.warningMsg);
        }
    }
    if (current.active && result != null) {
        new global.MLSolutionDefinitionUtils().trainCapabilitySolDef(current);
    }
}
