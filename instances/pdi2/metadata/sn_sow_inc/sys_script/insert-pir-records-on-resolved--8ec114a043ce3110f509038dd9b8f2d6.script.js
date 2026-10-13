(function executeRule(current, previous /*null when async*/ ) {
    var pirGr = new GlideRecordSecure('sn_sow_inc_post_incident_review');
    pirGr.addQuery('incident_ref', current.sys_id);
    pirGr.query();
    var pirManager = new PIRManager();
    if (!pirGr.hasNext()) {
        pirGr.initialize();
        pirGr.incident_ref = current.sys_id;
        pirGr.sys_domain = current.sys_domain;
        pirGr.state = 'draft';
        pirGr.insert();
        pirManager.createTimeLineEvents(current.sys_id);
        pirManager.syncIncidentSummary(current.sys_id);
    } else {
        var incidentSysId = current.sys_id;
        pirManager.updateSystemGeneratedEvent(incidentSysId);
    }
})(current, previous);
