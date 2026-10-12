function transform(input) {
    if (!input.librarySysId || input.librarySysId == '') {
        return {};
    }
    var tgr = new GlideAggregate('reconcile_duplicate_template');
    tgr.addAggregate('COUNT');
    tgr.addQuery('library', input.librarySysId);
    tgr.query();
    var templateCount = 0;
    var templateRunningCount = 0;
    if (tgr.next()) {
        templateCount = tgr.getAggregate('COUNT');
    }
    var trgr = new GlideAggregate('reconcile_duplicate_template_run');
    trgr.addQuery('template.library', input.librarySysId);
    trgr.addQuery('state', 'running');
    trgr.addAggregate('COUNT');
    trgr.query();
    if (trgr.next()) {
        templateRunningCount = trgr.getAggregate('COUNT');
    }
    var gr = new GlideRecord('sn_cmdb_ws_reconcile_duplicate_template_library');
    gr.addQuery('sys_id', input.librarySysId);
    gr.query();
    if (gr.next()) {
        return {
            libraryDetails: {
                name: gr.getValue('name'),
                description: gr.getValue('description'),
				templateCount: templateCount,
				templateRunningCount: templateRunningCount
            }
        };
    }
    return {};
}
