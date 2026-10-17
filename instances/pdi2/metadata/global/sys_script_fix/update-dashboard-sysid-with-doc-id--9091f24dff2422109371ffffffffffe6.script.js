gs.info('Before - update dashboard stats tables dashboard_sys_id column type with document_id');
fixDashboardSysIdStatsColumnType();
gs.info('After - update dashboard stats tables dashboard_sys_id column type with document_id');

function fixDashboardSysIdStatsColumnType() {
    if (pm.isZboot())
        return;

    var gr = new GlideRecord("sys_dictionary");
    gr.addEncodedQuery('element=dashboard_sys_id^name=dashboard_stats_executions^ORname=dashboard_stats^ORname=dashboard_executions');
    gr.query();
    while (gr.next()) {
        gr.setValue('internal_type', 'document_id');
        gr.setValue('reference', '');
        gr.setValue('reference_cascade_rule', '');
        gr.setValue('use_dependent_field', true);
        gr.setValue('dependent_on_field', 'dashboard_table');
        gr.setValue('dependent', 'dashboard_table');

        if (!gr.update())
            gs.log("fixDashboardSysIdStatsColumnType - failed to update dashboard_sys_id type to document_id");

    }
}
