var report = new GlideRecord('sys_report');
if (report.isValidField('sys_domain_path')) {
    report.addEncodedQuery('sys_domain_pathISEMPTY');
    report.query();

    var totalFound = report.getRowCount();
    var updateCount = 0;
    var skipCount = 0;

    gs.info("Found " + totalFound + " sys_report records with empty sys_domain_path");

    if (totalFound == 0) {
        // Deactivate script as no more requuired now.
        var scriptGR = new GlideRecord("sysauto_script");
        if (scriptGR.get("10ec155dfff6031077e4ffffffffff28")) {
            scriptGR.setValue("active", false);
            scriptGR.update();
            gs.info("No records to update. Script is deactivated.");
        }
    } else {

        while (report.next()) {
            try {
                if (report.sys_domain == 'global') {
                    report.sys_domain_path = '/';
                    report.setWorkflow(false);
                    report.autoSysFields(false);
                    report.update();
                    updateCount++;
                } else {
                    skipCount++;
                    gs.warn("Skipped sys_report " + report.sys_id +
                        " (non-global domain: " + report.sys_domain + ")");
                }
            } catch (e) {
                gs.error("Failed to update sys_report " + report.sys_id +
                    ": " + e.getMessage());
            }
        }

        gs.info("Completed: Updated=" + updateCount + ", Skipped=" + skipCount +
            ", Total=" + totalFound);
    }
} else {
    gs.error("sys_domain_path field does not exist on sys_report");
}
