(function() {
    var JOB_NAME = "Populate instance on KMF instance keys job";
    var JOB_EXECUTION_TIME = new GlideDateTime();
    var SCRIPT = "SNC.KMFFixes.attemptToUpdateInstanceKeysWithInstanceId();";
    GlideRunScriptJob.scheduleScript(SCRIPT, JOB_NAME, JOB_EXECUTION_TIME);
    gs.info("Successfully scheduled a new job to populate the source_instance_id field on KMF instance keys");
})();
