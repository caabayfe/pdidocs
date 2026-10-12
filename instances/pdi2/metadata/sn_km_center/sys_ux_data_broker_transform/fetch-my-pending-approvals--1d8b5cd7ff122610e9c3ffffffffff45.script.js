function transform() {
    var gr = new GlideRecordSecure('sysapproval_approver');
    var tables = new GlideTableHierarchy('kb_knowledge').getAllExtensions();
    gr.addQuery('source_table', 'IN', tables);
    gr.addQuery('state', '=', 'requested');
    gr.addQuery('approver', '=', gs.getUserID());

    gr.setLimit(4);
    gr.orderByDesc('sys_updated_on');
    gr.query();

    var showArticle = (gs.getProperty('glide.knowman.search.show_article_number', 'false')) == 'true';
    var kbMod = new global.KBViewModel();
    var showVersion = kbMod.isVersioningEnabled();

    var approvals = [];
    while (gr.next()) {
        var sourceTable = gr.getValue('source_table');
        if (sourceTable) {
            var kbGR = new GlideRecordSecure(sourceTable);
            kbGR.addQuery('sys_id', '=', gr.getValue('document_id'));
            kbGR.query();
            if (kbGR.next()) {
                approvals.push({
                    shortDescription: kbGR.getDisplayValue('short_description'),
                    number: kbGR.getDisplayValue('number'),
                    version: kbGR.getDisplayValue('version'),
                    source: kbGR.getClassDisplayValue(),
                    sysId: kbGR.getValue('sys_id'),
                    sourceTable: gr.getValue('source_table'),
                    approvalSysId: gr.getValue('sys_id')
                });
            }
        }
    }

    var agg = new GlideAggregate('sysapproval_approver');
    agg.addQuery('source_table', 'IN', tables);
    agg.addQuery('state', '=', 'requested');
    agg.addQuery('approver', '=', gs.getUserID());
    agg.addAggregate('COUNT');
    agg.query();
    var totalApprovals = 0;
    if (agg.next()) {
        totalApprovals = agg.getAggregate('COUNT');
    }

    return {
        approvals: approvals,
        totalApprovals: totalApprovals,
        props: {
            showArticle,
            showVersion
        }
    };
}
