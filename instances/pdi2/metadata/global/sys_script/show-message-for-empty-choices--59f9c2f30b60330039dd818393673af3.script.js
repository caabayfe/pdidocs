(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('notify_group_selector_choice');
	gr.addQuery('notify_group_selector', current.getUniqueValue());
	gr.setLimit(1);
	gr.query();
	if (!gr.hasNext())
		gs.addInfoMessage(gs.getMessage("There are no choices created for this provider selector. Create a choice for this selector."));
})(current, previous);
