(function executeRule(current, previous /*null when async*/ ) {

    var logSource = "3DESMigrationTriggerPostScan";
    var comboSysid = new sn_instance_scan.ScanUtil().getOrCreateComboFromSuiteAndTargets('527f5ff4ffd42210a9b0ffffffffff27', '', JSON.parse('[]'));
    gs.info("Fetch scan results for comboId:" + comboSysid, logSource);
    var scanResultGR = new GlideRecord("scan_result");
    scanResultGR.addQuery("combo", comboSysid);
    scanResultGR.orderByDesc("number");
    scanResultGR.query();
    if (!scanResultGR.hasNext())
        return;
    scanResultGR.next();
    resSysid = scanResultGR.getUniqueValue();
    gs.info("Fetch scan results for resultId:" + resSysid, logSource);
    if (resSysid != current.getUniqueValue())
        return;

    var dataObj = {};
    var scanFindingGR = new GlideRecord("scan_finding");
    scanFindingGR.addQuery("result", resSysid);
    scanFindingGR.query();
    while (scanFindingGR.next()) {
        if (!dataObj[scanFindingGR.getValue("source_table")]) {
            dataObj[scanFindingGR.getValue("source_table")] = [];
        }
        dataObj[scanFindingGR.getValue("source_table")].push(scanFindingGR.getValue("finding_details"));
    }
    gs.info("Fetch scan results with data:" + JSON.stringify(dataObj), logSource);
    var mergedAll = {};
    if (Object.keys(dataObj).length > 0) {
        var existingData = gs.getProperty("glide_encryption.non_password2_migration.table_columns", "{}");
        gs.info("Fetching existing Data:::" + existingData, logSource);
        var cleanedData = existingData
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
            .replace(/'/g, '"');
        var existingCleanedData = JSON.parse(cleanedData);
        mergedAll = mergeAndDedup(existingCleanedData, dataObj);
    }
    if (Object.keys(mergedAll).length > 0) {
        gs.info("Setting Property for table columns :" + JSON.stringify(mergedAll), logSource);
        gs.setProperty("glide_encryption.non_password2_migration.table_columns", formatObject(mergedAll));
        if (gs.getProperty("glide_encryption.non_password2_migration.auto_trigger", "false") === "true"){
            new InsertAndTriggerNP2MassMigrationJob();
            gs.setProperty("glide_encryption.non_password2_migration.auto_trigger", "false");
        }
    } else {
        gs.info("3DES data for string fields not found from scan", logSource);
        gs.setProperty("glide_encryption.nonpassword2_migration.executed", "true");
    }

    function mergeAndDedup(cleanedData, dataObj) {
        var merged = {};
        for (var key in cleanedData) {
            if (cleanedData.hasOwnProperty(key)) {
                merged[key] = cleanedData[key].slice();
            }
        }

        for (var key in dataObj) {
            if (dataObj.hasOwnProperty(key)) {
                if (merged.hasOwnProperty(key)) {
                    // Merge and deduplicate
                    var combined = merged[key].concat(dataObj[key]);
                    var unique = [];
                    var seen = {};

                    for (var i = 0; i < combined.length; i++) {
                        var val = combined[i];
                        if (!seen[val]) {
                            seen[val] = true;
                            unique.push(val);
                        }
                    }

                    merged[key] = unique;
                } else {
                    merged[key] = dataObj[key].slice();
                }
            }
        }
        return merged;
    }

    function formatObject(dataObj) {
        var formatted = '{';
        var entries = [];

        for (var key in dataObj) {
            if (dataObj.hasOwnProperty(key)) {
                entries.push(key + ":['" + dataObj[key].join("','") + "']");
            }
        }
        formatted += entries.join(',') + '}';
        return formatted;
    }
})(current, previous);
