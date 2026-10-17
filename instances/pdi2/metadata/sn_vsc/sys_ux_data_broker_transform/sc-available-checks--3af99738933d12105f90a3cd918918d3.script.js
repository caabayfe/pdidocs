function transform(input) {
    var scScanSuiteIds = [];
    //scScanSuiteIds.push("532840af20a70110fa9b96e15935cc77");
    var gr = new GlideRecord("scan_check_suite");
    gr.addEncodedQuery("sys_tags.e97202ce1ba201100fbd1066b04bcb30=e97202ce1ba201100fbd1066b04bcb30");
    gr.query();
    while (gr.next())
        scScanSuiteIds.push(gr.getUniqueValue());

    gr = new GlideRecord("scan_check_suite_m2m");
    gr.addEncodedQuery("parent_suite.sys_tags.e97202ce1ba201100fbd1066b04bcb30=e97202ce1ba201100fbd1066b04bcb30");
    gr.query();
    while (gr.next())
        scScanSuiteIds.push(gr.child_suite.sys_id);

    var checkIds = [];
    gr = new GlideRecord("scan_check_suite_check");
    gr.addEncodedQuery("suite.sys_idIN" + scScanSuiteIds.join(","));
    gr.query();
    while (gr.next()) {
        if (!checkIds.includes(gr.check.sys_id))
            checkIds.push(gr.check.sys_id);
    }

    return checkIds.join(",");
}
