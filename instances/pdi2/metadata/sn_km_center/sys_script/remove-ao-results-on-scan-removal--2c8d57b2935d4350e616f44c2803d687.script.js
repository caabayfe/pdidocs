(function executeRule(current, previous) {

    function isDefinitionInActiveScan(definitionSysId) {
        if (!definitionSysId) return false;
        var m2m = new GlideRecordSecure('kb_assist_job_m2m_scan');
        m2m.addQuery('scan_definition', definitionSysId);
        m2m.addQuery('kb_assist_job.active', true);
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

    // Re-check the affected definition(s) when a scan or job link is removed or updated.
    var affected = {};
    if (current.operation() === 'delete') {                 
        affected[current.getValue('scan_definition')] = true;
    } else {                                                
        if (previous) affected[previous.getValue('scan_definition')] = true;
        affected[current.getValue('scan_definition')] = true;
    }

    Object.keys(affected).forEach(function(definitionSysId) {
        if (definitionSysId && !isDefinitionInActiveScan(definitionSysId)) {
            purgeResultsForDefinition(definitionSysId);
        }
    });

})(current, previous);
