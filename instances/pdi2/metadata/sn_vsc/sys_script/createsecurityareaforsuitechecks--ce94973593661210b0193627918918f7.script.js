(function executeRule(current, previous /*null when async*/ ) {
    var suiteId = current.child_suite;
    if (!new ScanComparisonUtil().isSCChildSuite(suiteId)) return;
    var gr = new GlideRecord("scan_check_suite_check");
    gr.addQuery("suite", suiteId);
    gr.query();
    while (gr.next()) {
        new ScanComparisonUtil().createSecAreaRecord(gr.check);
    }

})(current, previous);
