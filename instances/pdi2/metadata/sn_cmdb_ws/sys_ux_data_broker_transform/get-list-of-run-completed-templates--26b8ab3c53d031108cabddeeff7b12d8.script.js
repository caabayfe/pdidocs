function transform(input) {
    var result = [];
    var response = {};
    var rdt = new GlideRecord('reconcile_duplicate_template_run');
    if (input.librarySysId) {
        rdt.addQuery('template.library', input.librarySysId);
    }
    rdt.addEncodedQuery('stateINcomplete,complete_with_errors,failed,canceled,cancel_requested');
	rdt.orderByDesc('completed');
	rdt.setLimit(100);
    rdt.query();

    while (rdt.next()) {
        var templateDetail = {};
        templateDetail['template_name'] = rdt.template.name.toString() + " (" +rdt.getValue("run_id") + ")";
        templateDetail['template_class'] = getTableLabel(rdt.template.table.getDisplayValue());
        templateDetail['template_run_sys_id'] = rdt.sys_id.toString();
        templateDetail['template_run_state'] = rdt.state.toString();
        templateDetail['template_run_state_display_value'] = rdt.state.getDisplayValue();
        templateDetail['template_task_count'] = rdt.getValue('total');
		templateDetail['template_task_errors'] = rdt.getValue('errors');
		templateDetail['template_task_skipped'] = rdt.getValue('skipped');
		templateDetail['template_run_time'] = rdt.getDisplayValue('run_time');
		templateDetail['template_task_processed'] = rdt.getValue('processed');
        result.push(templateDetail);
    }

    function getTableLabel(table) {
        var dbo = new GlideRecord('sys_db_object');
        dbo.addQuery('name', table);
        dbo.query();
        if (dbo.next()) {
            return dbo.getValue('label');
        }
        return null;
    }
    response.templateDetails = result;
    response.lastUpdatedInfoText = gs.getMessage("Last updated: {0}", new GlideDateTime().getDisplayValue());
    return response;
}
