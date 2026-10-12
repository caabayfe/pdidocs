(function executeRule(current, previous /*null when async*/ ) {
    try {

        //constants
        var CLUSTERING_STATS = "clustering_stats.gz";

        var mlModelArtifactId = current.getValue('table_sys_id');
        var modelArtifactRecord = new GlideRecord("ml_model_artifact");
        modelArtifactRecord.get(mlModelArtifactId);

        if (modelArtifactRecord.getValue("model_id") == CLUSTERING_STATS) {
            gs.debug('[Clustering] Clustering stats Attachment inserted ' + current.table_sys_id);
            var sysAttachmentId = current.getValue("sys_id");
            var sysAttachmentList = modelArtifactRecord.getValue("artifacts_to_process");
            if (!sysAttachmentList) {
                sysAttachmentList = [];

            } else {
                sysAttachmentList = sysAttachmentList.split();
            }
            sysAttachmentList.push(sysAttachmentId);
            modelArtifactRecord.artifacts_to_process = sysAttachmentList.toString();
            modelArtifactRecord.update();

            gs.debug('[Clustering] Clustering Stats push initialized');
        }

    } catch (e) {
        gs.error('[Clustering] Error processing clustering stats attachment: ' + e.message + ' \n' + JSON.stringify(e, null, 2));
    }

})(current, previous);
