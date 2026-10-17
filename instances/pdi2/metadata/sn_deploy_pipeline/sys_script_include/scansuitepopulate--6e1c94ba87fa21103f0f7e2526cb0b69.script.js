var ScanSuitePopulate = Class.create();

(function() {
    ScanSuitePopulate.missingSuiteErrorMsg = function(suiteId, type) {
        var errMsg;
        if (type === ScanSuiteConstants.INSTANCE_SCAN_SUITE) {
            errMsg = gs.getMessage("Missing Instance scan suite with id '{0}' on test instance.", [suiteId]);
        } else if (type === ScanSuiteConstants.ATF_SCAN_SUITE) {
            errMsg = gs.getMessage("Missing ATF scan suite with id '{0}' on test instance.", [suiteId]);
        }
        gs.addErrorMessage(errMsg);
    };

    ScanSuitePopulate.existingSuiteInfoMsg = function(suiteId, type) {
        var infoMsg;
        if (type === ScanSuiteConstants.INSTANCE_SCAN_SUITE) {
            infoMsg = gs.getMessage("Instance scan suite with id '{0}' exists in the table.", [suiteId]);
        } else if (type === ScanSuiteConstants.ATF_SCAN_SUITE) {
            infoMsg = gs.getMessage("ATF scan suite with id '{0}' exists in the table.", [suiteId]);
        }
        gs.addInfoMessage(infoMsg);
    };

    ScanSuitePopulate.insertSuiteInfoMsg = function(suiteId, type) {
        var infoMsg;
        if (type === ScanSuiteConstants.INSTANCE_SCAN_SUITE) {
            infoMsg = gs.getMessage("Inserted Instance scan suite with id '{0}'.", [suiteId]);
        } else if (type === ScanSuiteConstants.ATF_SCAN_SUITE) {
            infoMsg = gs.getMessage("Inserted ATF scan suite with id '{0}'.", [suiteId]);
        }
        gs.addInfoMessage(infoMsg);
    };

    ScanSuitePopulate.addScanSuite = function(suiteToRemoteSuiteLookup, suiteId, type) {
        if (!suiteToRemoteSuiteLookup[suiteId]) {
            ScanSuitePopulate.missingSuiteErrorMsg(suiteId, type);
            return;
        }

        try {
            var scanSuiteGR = new GlideRecordSecure(ScanSuiteConstants.SCAN_SUITE_TABLE);
            scanSuiteGR.setValue('suite', suiteToRemoteSuiteLookup[suiteId]);
            scanSuiteGR.setValue('error_severity', 'warning');
            scanSuiteGR.setValue('instance_type', 'test');
            scanSuiteGR.insert();
            ScanSuitePopulate.insertSuiteInfoMsg(suiteId, type);
        } catch (e) {
            gs.error("Error inserting scan suite: " + e);

            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage(gs.getMessage("Error inserting scan suite."));
        }

    };

    ScanSuitePopulate.addDefaultScanSuites = function() {
        var suiteToRemoteSuiteLookup = {};
        var existingSuiteLookup = {};
        var defaultSuiteIds = [ScanSuiteConstants.INSTANCE_SCAN_SUITE_ID, ScanSuiteConstants.ATF_SCAN_SUITE_ID];
        var defaultRemoteSuiteIds = [ScanSuiteConstants.INSTANCE_SCAN_SUITE_REMOTE_ID, ScanSuiteConstants.ATF_SCAN_SUITE_REMOTE_ID];

        var remoteScanSuiteGR = new GlideRecordSecure(ScanSuiteConstants.SCAN_SUITE_REMOTE_TABLE);
        var scanSuiteGR = new GlideRecordSecure(ScanSuiteConstants.SCAN_SUITE_TABLE);

        remoteScanSuiteGR.addQuery('suite_sys_id', 'IN', defaultSuiteIds);
        remoteScanSuiteGR.query();

        while (remoteScanSuiteGR.next()) {
            suiteToRemoteSuiteLookup[remoteScanSuiteGR.getValue('suite_sys_id')] = remoteScanSuiteGR.getValue('sys_id');
        }

        scanSuiteGR.addQuery('suite', 'IN', defaultRemoteSuiteIds);
        scanSuiteGR.query();

        while (scanSuiteGR.next()) {
            existingSuiteLookup[scanSuiteGR.suite.suite_sys_id] = true;
        }

        if (!existingSuiteLookup[ScanSuiteConstants.INSTANCE_SCAN_SUITE_ID]) {
            // Adding default instance scan suite
            ScanSuitePopulate.addScanSuite(suiteToRemoteSuiteLookup, ScanSuiteConstants.INSTANCE_SCAN_SUITE_ID, ScanSuiteConstants.INSTANCE_SCAN_SUITE);
        } else {
            ScanSuitePopulate.existingSuiteInfoMsg(ScanSuiteConstants.INSTANCE_SCAN_SUITE_ID, ScanSuiteConstants.INSTANCE_SCAN_SUITE);
        }


        if (!existingSuiteLookup[ScanSuiteConstants.ATF_SCAN_SUITE_ID]) {
            // Adding ATF scan suite
            ScanSuitePopulate.addScanSuite(suiteToRemoteSuiteLookup, ScanSuiteConstants.ATF_SCAN_SUITE_ID, ScanSuiteConstants.ATF_SCAN_SUITE);
        } else {
            ScanSuitePopulate.existingSuiteInfoMsg(ScanSuiteConstants.ATF_SCAN_SUITE_ID, ScanSuiteConstants.ATF_SCAN_SUITE);
        }
    };

    ScanSuitePopulate.prototype = {
        initialize: function() {},

        type: 'ScanSuitePopulate'
    };
})();
