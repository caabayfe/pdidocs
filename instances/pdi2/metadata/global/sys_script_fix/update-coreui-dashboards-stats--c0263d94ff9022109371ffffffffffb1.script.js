function updateDashboardStatsWithTableAndLastViewedOn(batchSize) {
    var ga = new GlideAggregate('dashboard_stats');
    ga.addAggregate('COUNT');
    ga.query();

    if (ga.next()) {
        var totalRows = ga.getAggregate('COUNT');
        var updatedCount = 0;

        while (updatedCount < totalRows) {
            var gr = new GlideRecord('dashboard_stats');
            gr.addNullQuery('last_viewed_on');
            gr.setLimit(batchSize);
			gr.setWorkflow(false);
            gr.autoSysFields(false); // Prevents sys_updated_on update
            gr.query();

            // Safety check to avoid going into infinite loop
            if (!gr.hasNext())
              break;

            while (gr.next()) {
                gr.setValue('last_viewed_on', gr.getValue('sys_updated_on'));
                gr.setValue('dashboard_table', 'pa_dashboards');
                gr.setWorkflow(false);
                gr.update();
                updatedCount++;
            }
        }
    }
}

function updateWithDashboardTable(table) {
    var gr = new GlideRecord(table);
    gr.setValue('dashboard_table', 'pa_dashboards');
    gr.updateMultiple();
}

updateDashboardStatsWithTableAndLastViewedOn(5000);
updateWithDashboardTable('dashboard_stats_executions');
updateWithDashboardTable('dashboard_executions');
