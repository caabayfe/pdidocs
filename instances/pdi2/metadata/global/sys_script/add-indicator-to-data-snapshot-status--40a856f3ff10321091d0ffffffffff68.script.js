(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('pa_indicator_data_snapshot_status');
	gr.setValue('indicator', current.sys_id);
	gr.setValue('data_snapshot_status', 6);
	gr.insert();
})(current, previous);
