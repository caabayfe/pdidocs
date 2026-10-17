getAuditorFindingsCount();

function getAuditorFindingsCount() {
    var findingsCount = 0;
    var gr = new GlideRecord('scan_suite_execution');
    gr.addQuery('suite', '833655cc1b94101046e87733cd4bcb4e');
    gr.orderByDesc('sys_created_on');
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        var resultId = gr.getValue('result');
        var grFinding = new GlideAggregate('scan_finding');
        grFinding.addQuery('result', resultId);
        grFinding.addAggregate('COUNT');
        grFinding.query();
        if (grFinding.next()) {
            findingsCount = grFinding.getAggregate('COUNT');
        }

    }
    return findingsCount;
}
