(function executeRule(current, previous /*null when async*/ ) {
    if (current.source_record) {
        var finding = new GlideRecord("sn_access_analyzer_access_finding");
        if (finding.get(current.source_record)) {
            finding.security_task = current.sys_id;
            finding.update();
        }
    }
})(current, previous);
