(function executeRule(current, previous /*null when async*/ ) {

    //Trigger default comparison
    var gr = new GlideRecord('scan_suite_execution');
    gr.addQuery('result', current.sys_id);
    gr.query();
    if (gr.next() && gr.suite.toString() == '833655cc1b94101046e87733cd4bcb4e') {
        new sn_vsc.ScanComparisonUtil().defaultComparison();
    }

})(current, previous);
