createUIAction(current);
deleteUIAction(current);

function createUIAction(current) {
	var gr = new GlideRecord("sys_ui_action");
	if (!current.enable_ui_action.nil()) {
		gr.get(current.enable_ui_action);
	}
	gr.name = "Enable Ratings";
	gr.table = current.table;
	gr.action_name = "enable_ratings";
	gr.form_button = true;
	gr.list_choice = true;
	gr.show_update = true;
	gr.active = true;
	gr.condition = "new SNC.Rating().checkForRatings('" + current.table + "', current.sys_id)==false;";
	gr.script = "new SNC.AssessmentCreation().createAssessableRecord('" + current.sys_id + "', current.sys_id);";
	if (current.business_rule.nil()) {
		var br = gr.insert();
		current.enable_ui_action = br;
	} else
		gr.update();
		
}

function deleteUIAction(current) {
	var gr = new GlideRecord("sys_ui_action");
	if (!current.disable_ui_action.nil()) {
		gr.get(current.disable_ui_action);
	}
	gr.name = "Disable Ratings";
	gr.table = current.table;
	gr.action_name = "disable_ratings";
	gr.form_button = true;
	gr.list_choice = true;
	gr.show_update = true;
	gr.active = true;
	gr.condition = "new SNC.Rating().checkForRatings('" + current.table + "', current.sys_id);";
	gr.script = "new SNC.AssessmentCreation().deleteAssessableRecord('" + current.sys_id + "', current.sys_id);";
	if (current.business_rule.nil()) {
		var br = gr.insert();
		current.disable_ui_action = br;
	} else
		gr.update();
}
