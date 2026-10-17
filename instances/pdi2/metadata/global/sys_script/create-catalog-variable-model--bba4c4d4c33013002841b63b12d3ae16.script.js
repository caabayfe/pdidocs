(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_flow_cat_variable_model");
	gr.name = current.name;
	gr.id = current.sys_id;
	if (current.sys_class_name == "sys_hub_flow_snapshot") {
		var snapshot = new GlideRecord("sys_hub_flow_snapshot");
		snapshot.get(current.sys_id);
		if (!snapshot.master)
			gr.setWorkflow(false);
	}
	
	gr.insert();
})(current, previous);
