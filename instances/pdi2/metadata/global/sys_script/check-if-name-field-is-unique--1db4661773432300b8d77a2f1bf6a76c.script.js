(function executeRule(current, previous /*null when async*/) {
	if(!current.getValue('field_name'))
		return;
	
	var fieldName = current.getValue('field_name');
	var screen = current.getValue('screen');
	gr = new GlideRecord('sys_sg_screen_field');
	gr.addQuery('data_item_field_name', fieldName);
	gr.addQuery('screen', screen);
	gr.query();
	if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addInfoMessage(gs.getMessage('Name field must be unique'));
		current.setAbortAction(true);
	}	


})(current, previous);
