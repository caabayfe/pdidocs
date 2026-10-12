(function executeRule(current, previous /*null when async*/) {

	gr = new GlideRecord('sys_sg_screen_field');
    gr.addQuery('data_item_field_name', current.type);
	gr.addQuery('screen', current.getValue('screen'));
	gr.query();
	if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addInfoMessage(gs.getMessage('Support only one rating button of same type'));
		current.setAbortAction(true);
	} else
		current.data_item_field_name = current.type;

})(current, previous);
