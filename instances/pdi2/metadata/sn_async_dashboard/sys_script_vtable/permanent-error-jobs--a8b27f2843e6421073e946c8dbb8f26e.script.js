(function executeQuery(v_table, v_query) {
	var utils = new AsyncDashboardUtils();
	var gr = utils.getPermanentErrorJobs();

    while (gr.next()) {
        var row = {
            sys_id: gr.getUniqueValue(),
			name: gr.getUniqueValue(),
			last_error: gr.getValue("last_error"),
			trigger_type: gr.getValue("trigger_type"),
			priority: gr.getValue("priority"),
			next_action: gr.getValue("next_action"),
			state: gr.getValue("state"),
			lateness: utils.getTimeDelayed(new GlideDateTime(gr.getValue("next_action")), new GlideDateTime(gr.getValue("sys_updated_on")))
        };
        v_table.addRow(row);
    }
  })(v_table, v_query);
