var ScanSuites = Class.create();
ScanSuites.prototype = {
    initialize: function() {

    },

    getScanSuites: function() {
        var results = {};
        results[ScanSuiteConstants.INSTANCE_SCAN_SUITES] = [];
        results[ScanSuiteConstants.ATF_SCAN_SUITES] = [];

        var gr = new GlideRecord(ScanSuiteConstants.SCAN_SUITE_TABLE);
        gr.addQuery(ScanSuiteConstants.INSTANCE_TYPE, ScanSuiteConstants.INSTANCE_TYPE_TEST);
        gr.query();

        while (gr.next()) {
            var suiteType = gr.suite.getRefRecord().getValue(ScanSuiteConstants.SUITE_TYPE);
            var suite = {};
            suite[ScanSuiteConstants.SUITE_ID] = gr.suite.getRefRecord().getValue(ScanSuiteConstants.SUITE_SYS_ID);
            suite[ScanSuiteConstants.SUITE_NAME] = gr.suite.getRefRecord().getValue(ScanSuiteConstants.SUITE_NAME);
            suite[ScanSuiteConstants.ERROR_SEVERITY] = gr.getValue(ScanSuiteConstants.ERROR_SEVERITY);

            if (suiteType === ScanSuiteConstants.INSTANCE_SCAN_SUITE) {
                results[ScanSuiteConstants.INSTANCE_SCAN_SUITES].push(suite);
            }
            if (suiteType === ScanSuiteConstants.ATF_SCAN_SUITE) {
                results[ScanSuiteConstants.ATF_SCAN_SUITES].push(suite);
            }
        }

        return results;
    },

    type: 'ScanSuites'
};
