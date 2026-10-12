function transform(input) {
	var taskId = input.taskId;
	var gr = new GlideRecord('cmdb_data_management_task');
	if (gr.get(taskId)) {
		var hasChange = false;
		if (gr.getValue('assigned_to') === null) {
			gr.setValue('assigned_to', gs.getUserID()); // set task to current logged in user
			hasChange = true;
		}
		var state = gr.getValue('state');
		if (state == '1' || state == '-5') { // Pending or open state
			gr.setValue('state', '2'); // Work in progress
			hasChange = true;
		}
		if (gr.canWrite() && hasChange) {
			gr.update();
		}
	}
}
