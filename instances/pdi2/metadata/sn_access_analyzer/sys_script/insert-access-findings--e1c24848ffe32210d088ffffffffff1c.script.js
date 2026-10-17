(function executeRule(current, previous /*null when async*/ ) {

    var checkExec = new GlideRecord('scan_check_execution');
    checkExec.addEncodedQuery('check.sys_tags.87a270d7ff803210d088ffffffffff28=87a270d7ff803210d088ffffffffff28^result=' + current.sys_id);
    checkExec.setLimit(1);
    checkExec.query();

    var scanExec = new GlideRecord('scan_suite_execution');
    scanExec.addEncodedQuery('suite.sys_tags.87a270d7ff803210d088ffffffffff28=87a270d7ff803210d088ffffffffff28^result=' + current.sys_id);
    scanExec.setLimit(1);
    scanExec.query();

    if (checkExec.hasNext() || scanExec.hasNext()) {

        var scanFinding = new GlideRecord("scan_finding");
        scanFinding.addEncodedQuery('check.sys_tags.87a270d7ff803210d088ffffffffff28=87a270d7ff803210d088ffffffffff28^result=' + current.sys_id);
        scanFinding.query();

        while (scanFinding.next()) {
            try {
                var check = scanFinding.getValue("check");
                var source = scanFinding.getValue("source");
                var sourceTable = scanFinding.getValue("source_table");

                if (!check || !source) {
                    gs.warn('Missing check or source data for finding: ' + scanFinding.sys_id);
                    continue;
                }

                // Check if access finding already exists
                var accessFinding = new GlideRecord("sn_access_analyzer_access_finding");
                accessFinding.addQuery("check", check);
                accessFinding.addQuery("finding.source", source); // dot-walk is valid here
                accessFinding.addQuery("finding.source_table", sourceTable);
                accessFinding.query();
                if (accessFinding.next()) {
                    accessFinding.setValue("finding", scanFinding.sys_id);
                    accessFinding.update();
                } else {
                    accessFinding.initialize();
                    accessFinding.setValue("check", check);
                    accessFinding.setValue("finding", scanFinding.sys_id);
                    accessFinding.insert();
                }

            } catch (e) {
                gs.error('Error processing scan finding ' + scanFinding.sys_id + ': ' + e);
            }
        }
    }
})(current, previous);
