function onBefore(current, previous) {
	if(current.type == 2) {
		if (current.reference_table != previous.reference_table) {
			_validateFieldType(current);
		}
	} else if (current.type == 4) {
		var childPublisher = new GlideRecord("sys_ui_hp_group");
		childPublisher.addQuery("child_publisher", current.sys_id);
		childPublisher.query();
		if(childPublisher.next()) {
			current.type.setError(gs.getMessage("Publisher is part of an existing group"));
			current.setAbortAction(true);
		}
	}
}

function _validateFieldType(current) {
	var reference = new GlideRecord("sys_ui_hp_reference");
	reference.addQuery("publisher_reference", current.sys_id);
	reference.query();
	
	if(reference.next()) {
		var reference_table = reference.getValue("reference_table");
		var reference_field = reference.getValue("reference_field");
		
		var gr = new GlideRecord(reference_table);
		var element = gr.getElement(reference_field);
		var ed = element.getED();
		if(current.reference_table != ed.getReference()) {
			gs.addErrorMessage(gs.getMessage('Configured publisher references are of different type "{0}"', ed.getReference()));
			current.setAbortAction(true);
		}
	}
}
