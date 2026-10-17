var constants = new sn_vsc.SecurityCenterConstants();
var gr = new GlideRecord("sn_vsc_check_security_area");
gr.query();
while (gr.next()) {
    var checkId = gr.getValue("cat_check");
    //verify if check belongs to Security center suite
    var grSuiteCheck = new GlideRecord("scan_check_suite_check");
    grSuiteCheck.addQuery("check", checkId);
    grSuiteCheck.query();
    if (!grSuiteCheck.next()) { //check is not assigned to any suite
        gr.deleteRecord();
        continue;
    }
    var suiteId = grSuiteCheck.getValue("suite");
    //Exclude OOB suites
    if (new sn_vsc.ScanComparisonUtil().isSecCenterOOBSuite(suiteId)) continue; //Any updates to OOB suites should be done via app release

    //Check if this check is part of Security center suite
    var grSuite = new GlideRecord("scan_check_suite");
    grSuite.addEncodedQuery("sys_id=" + suiteId + "^" + constants.SC_SUITE_TAG, true);
    grSuite.query();
    if (!grSuite.next()) {
        //check if this is child suite and tag is assigned to parent suite
        var grChildSuite = new GlideRecord("scan_check_suite_m2m");
        grChildSuite.addQuery("child_suite", suiteId);
        grChildSuite.query();
        if (!grChildSuite.next()) { //check is not part of any child suite
            gr.deleteRecord();
            continue;
        }
        var parentSuite = grChildSuite.getValue("parent_suite");
        var grParentSuite = new GlideRecord("scan_check_suite");
        grParentSuite.addEncodedQuery("sys_id=" + parentSuite + "^" + constants.SC_SUITE_TAG, true);
        grParentSuite.query();
        if (!grParentSuite.next()) { //Parent suite doesn't have SC suite tag assigned
            gr.deleteRecord();
            continue;
        }
    }
}
