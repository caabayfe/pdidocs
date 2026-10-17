(function executeRule(current, previous /*null when async*/ ) {

    try {

        var GENERATED_DATA = "sygra_synth_data_artifact.gz";

        var mlModelArtifactId = current.getValue('table_sys_id');
        var modelArtifactRecord = new GlideRecord("ml_model_artifact");
        modelArtifactRecord.get(mlModelArtifactId);

        if (modelArtifactRecord.getValue("model_id") == GENERATED_DATA) {
            gs.debug('[Sygra] Sygra Generated Data Attachment inserted ' + current.table_sys_id);
            var sysAttachmentId = current.getValue("sys_id");
            var solutionId = modelArtifactRecord.getValue("solution");
            sn_ml.MLRecordUtil.publishSygraGeneratedData(solutionId, sysAttachmentId);
            gs.debug('[Sygra] Started data population for Sygra generated data ' + current.table_sys_id);

        }

    } catch (e) {
        gs.error('[Sygra] Error publishing Sygra generated data: ' + e.message + ' \n' + JSON.stringify(e, null, 2));
    }

})(current, previous);
