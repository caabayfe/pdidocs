(function() {
    var resultIdLatest = '';

    // Get the latest scan result
    var scan = new GlideRecord("scan_result");
    scan.addEncodedQuery("combo.sourcesLIKEf5648afdff503210d088ffffffffff08^state=complete^scan_type=instance_scan");
    scan.orderByDesc("sys_created_on");
    scan.setLimit(1);
    scan.query();
    if (scan.next()) {
        resultIdLatest = scan.getUniqueValue();
    }

    if (!resultIdLatest)
        return;

    // Resolve findings that were in older scans but not in latest
    var oldFinding = new GlideRecord("sn_access_analyzer_access_finding");
    oldFinding.addQuery("finding.result", "!=", resultIdLatest); // all except latest
    oldFinding.addQuery("status", "open");
    oldFinding.query();
    while (oldFinding.next()) {
        var checkFinding = new GlideRecord("sn_access_analyzer_access_finding");
        checkFinding.addQuery("check", oldFinding.getValue("check"));
        checkFinding.addQuery("finding.source", oldFinding.getValue("finding.source"));
        checkFinding.addQuery("finding.source_table", oldFinding.getValue("finding.source_table"));
        checkFinding.addQuery("finding.result", resultIdLatest);
        checkFinding.query();

        if (!checkFinding.hasNext()) {
            // mark as resolved if not present in latest
            oldFinding.status = "resolved";
            oldFinding.update();
        }
    }

    // Reopen resolved findings if they reappeared in latest
    var oldResolvedFinding = new GlideRecord("sn_access_analyzer_access_finding");
    oldResolvedFinding.addQuery("status", "resolved");
    oldResolvedFinding.query();
    while (oldResolvedFinding.next()) {
        var checkFin = new GlideRecord("sn_access_analyzer_access_finding");
        checkFin.addQuery("check", oldResolvedFinding.getValue("check"));
        checkFin.addQuery("finding.source", oldResolvedFinding.getValue("finding.source"));
        checkFin.addQuery("finding.source_table", oldResolvedFinding.getValue("finding.source_table"));
        checkFin.addQuery("finding.result", resultIdLatest);
        checkFin.query();

        if (checkFin.hasNext()) {
            oldResolvedFinding.status = "open";
            oldResolvedFinding.update();
        }
    }
})();
