(function executeRule(current, previous /*null when async*/) {
	const name = current.name;

	if (!name) {
		gs.addErrorMessage(gs.getMessage('"name" is required and cannot be empty.'));
		current.setAbortAction(true);
	}

	const gr = new GlideRecord('sn_pipeline_pipeline_type');
	gr.addQuery("name", name);
	gr.addQuery("sys_id", "!=", current.sys_id);
	gr.query();

	if(gr.hasNext()) {
		gs.addErrorMessage(
			gs.getMessage('A pipeline type with the name "{0}" already exists, please choose another name.', name)
		);
		
		current.setAbortAction(true);
	}

})(current, previous);
