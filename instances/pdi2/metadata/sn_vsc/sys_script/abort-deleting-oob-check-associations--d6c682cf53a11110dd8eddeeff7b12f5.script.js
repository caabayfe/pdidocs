(function executeRule(current, previous /*null when async*/ ) {

	//Restrict user from deleting OOB check assignments
    var gr = new GlideRecord('scan_check_suite_check');
    gr.addQuery('check', current.cat_check);
    gr.query();
    while (gr.next()) {
        if (new sn_vsc.ScanComparisonUtil().isSecCenterOOBSuite(gr.suite)) {
            gs.addErrorMessage(gs.getMessage('OOB Check assignment cannot be deleted'));
            current.setAbortAction(true);
        }
    }

})(current, previous);
