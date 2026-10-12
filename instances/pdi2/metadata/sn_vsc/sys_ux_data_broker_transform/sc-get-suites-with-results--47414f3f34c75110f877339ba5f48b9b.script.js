function transform(input) {
    var suiteList = [];
    var gr = new GlideAggregate('scan_suite_execution');
    gr.addEncodedQuery("suite.sys_tags.e97202ce1ba201100fbd1066b04bcb30=e97202ce1ba201100fbd1066b04bcb30^ORsuite=833655cc1b94101046e87733cd4bcb4e");
    gr.groupBy('suite');
    gr.addAggregate('count', 'result');
    gr.addHaving('COUNT', '>', '1');
    gr.query();
    while (gr.next()) {
        var suiteId = gr.suite.toString();
        var suiteName = gr.suite.getDisplayValue().toString();
        suiteList.push({
            "label": suiteName,
            "id": suiteId
        });
    }

    return suiteList;

}
