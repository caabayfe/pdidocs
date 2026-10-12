//constants
var CLUSTERING_STATS = "clustering_stats.gz";

var modelArtifactRecord = new GlideRecord("ml_model_artifact");
modelArtifactRecord.addQuery("model_id", CLUSTERING_STATS);
modelArtifactRecord.query();
while (modelArtifactRecord.next()) {
    var artifactsToProcess = modelArtifactRecord.getValue("artifacts_to_process");
    if (!artifactsToProcess) {
        continue;
    } else {
        var sysTrigger = new GlideRecord("sys_trigger");
        var mlModelArtifactId = modelArtifactRecord.getValue("sys_id");
        sysTrigger.addQuery("name", mlModelArtifactId);
        sysTrigger.query();

        if (!sysTrigger.next()) {
            artifactsToProcess = artifactsToProcess.split(",");
            var sysAttachmentId = artifactsToProcess.shift();
            var solutionId = modelArtifactRecord.getValue("solution");

            var sysAutoScriptRecord = new GlideRecord("sysauto_script");
            sysAutoScriptRecord.initialize();
            sysAutoScriptRecord.setValue("name", mlModelArtifactId);
            sysAutoScriptRecord.setValue("script", "sn_ml.ClusteringSolutionVersion.publishStatsJob(\"" + solutionId + "\",\"" + sysAttachmentId + "\");");
            sysAutoScriptRecord.setValue("run_type", "once");
            sysAutoScriptRecord.insert();

            modelArtifactRecord.artifacts_to_process = artifactsToProcess.toString();
            modelArtifactRecord.update();
        }
    }
}
