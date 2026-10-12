new ScanAjaxProcessor().collectUsageMetric('scheduled_scan_ui_submit_new_record_button_clicked');
answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
var capability = current.capability.getRefRecord().getValue("value");
var mlSolutionDefinitionUtils = new MLSolutionDefinitionUtils();
if (mlSolutionDefinitionUtils.isMLWorkflowMigrationEnabled(capability)) {
    if (capability == "classification_trainer") {
        current.capability = mlSolutionDefinitionUtils.getCapability("workflow_classification_trainer");
        current.update();
    } else if (capability == "regression_trainer") {
        current.capability = mlSolutionDefinitionUtils.getCapability("workflow_regression_trainer");
        current.update();
    } else if (capability == "clustering_trainer") {
        current.capability = mlSolutionDefinitionUtils.getCapability("workflow_clustering_trainer");
        current.update();
    } else if (capability == "similarity_trainer") {
        current.capability = mlSolutionDefinitionUtils.getCapability("workflow_similarity_trainer");
        current.update();
    }
}
