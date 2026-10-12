function transform(input) {
    var result = '';
    var gr = new GlideRecord('sn_vsc_scan_summary');
    gr.addQuery('suite', input.suite);
    gr.addQuery('result_created_on', input.date);
    gr.query();
    if (gr.next()) {
        result = gr.getValue('result');
    } else {
        var gr_latest = new GlideRecord('scan_suite_execution');
        gr_latest.addQuery('suite', input.suite);
        gr_latest.orderByDesc('sys_created_on');
        gr_latest.setLimit(1);
        gr_latest.query();
        if (gr_latest.next()) {
            result = gr_latest.getValue('result');
        }
    }
    return result;
}
