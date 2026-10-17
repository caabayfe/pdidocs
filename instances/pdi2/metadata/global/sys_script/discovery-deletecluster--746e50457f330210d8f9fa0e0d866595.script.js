(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('discovery_schedule');
    gr.addQuery('mid_cluster', current.sys_id);
    gr.query();
    if (gr.next()) {
        var count = gr.getRowCount();
        var name = gr.getValue('name');
        var message;
        if (count > 1) {
			var otherCount = (count - 1).toString();
			message = sn_i18n.Message.getMessage('global-discovery', 'mid_cluster_multiple_use', {scheduleName: name, additionalScheduleCount: otherCount});
		} else
			message = sn_i18n.Message.getMessage('global-discovery', 'mid_cluster_single_use', {scheduleName: name});
        gs.addErrorMessage(message);
        current.setAbortAction(true);
    }
})(current, previous);
