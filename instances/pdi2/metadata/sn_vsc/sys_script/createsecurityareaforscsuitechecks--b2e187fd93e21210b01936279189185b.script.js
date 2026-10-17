(function executeRule(current, previous /*null when async*/ ) {
    var constants = new sn_vsc.SecurityCenterConstants();
    var suiteId = current.suite;
    var grSuite = new GlideRecord("scan_check_suite");
    grSuite.addEncodedQuery("sys_id=" + suiteId + "^" + constants.SC_SUITE_TAG, true);
    grSuite.query();
    if (grSuite.next() || new ScanComparisonUtil().isSCChildSuite(suiteId)) {
        new ScanComparisonUtil().createSecAreaRecord(current.check);
    }
})(current, previous);
