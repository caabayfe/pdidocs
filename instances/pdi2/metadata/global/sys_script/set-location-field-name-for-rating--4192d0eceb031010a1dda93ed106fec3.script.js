(function executeRule(current, previous /*null when async*/) {

	gr = new GlideRecord('sys_sg_button_instance');
    gr.addQuery('parent', current.parent);
	gr.addQuery('button', current.button);
	gr.addQuery('field_name', current.button.type);
	gr.query();
	if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addInfoMessage(gs.getMessage('Support only one button instance of same rating button type'));
		current.setAbortAction(true);
	} else {
		current.field_name = current.button.type;
		current.location.setValue("field");
	}

})(current, previous);
