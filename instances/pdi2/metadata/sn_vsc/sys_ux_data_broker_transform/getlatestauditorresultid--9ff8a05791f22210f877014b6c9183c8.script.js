function transform(input) {
    var resultId = '';
    var gr = new GlideRecord('scan_suite_execution');
    gr.addQuery('suite', '833655cc1b94101046e87733cd4bcb4e');
    gr.orderByDesc('sys_created_on');
    gr.setLimit(1);
    gr.query();
    if (gr.next())
        resultId = gr.getValue('result');

    return resultId;
}
