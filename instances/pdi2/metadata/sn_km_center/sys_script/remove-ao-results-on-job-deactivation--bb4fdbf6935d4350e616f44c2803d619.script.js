(function executeRule(current, previous) {

    function isDefinitionInActiveScan(definitionSysId) {
        if (!definitionSysId) return false;
        var m2m = new GlideRecordSecure('kb_assist_job_m2m_scan');
        m2m.addQuery('scan_definition', definitionSysId);
        m2m.addQuery('kb_assist_job.active', true);   // this job is now inactive → excluded
        m2m.setLimit(1);
        m2m.query();
        return m2m.hasNext();
    }

    function purgeResultsForDefinition(definitionSysId) {
        if (!definitionSysId) return;
        var gr = new GlideRecordSecure('kb_assist_scan_result');
        gr.addQuery('scan_definition', definitionSysId);
        gr.query();
        // Only knowledge admins can modify jobs/scans, so per-record ACL
        // evaluation is not a concern here; deleteMultiple is safe and faster.
        gr.deleteMultiple();
    }

    // For each scan in the deactivated job, delete results if it's no longer on
    // any OTHER active job.
    var jobScans = new GlideRecordSecure('kb_assist_job_m2m_scan');
    jobScans.addQuery('kb_assist_job', current.getUniqueValue());
    jobScans.query();
    while (jobScans.next()) {
        var definitionSysId = jobScans.getValue('scan_definition');
        if (definitionSysId && !isDefinitionInActiveScan(definitionSysId)) {
            purgeResultsForDefinition(definitionSysId);
        }
    }

})(current, previous);
