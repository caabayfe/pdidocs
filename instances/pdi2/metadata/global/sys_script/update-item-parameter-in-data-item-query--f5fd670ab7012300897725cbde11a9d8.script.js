(function executeRule(current, previous /*null when async*/) {
	if (!current.parent || !current.parent.query_condition)
		return;

	var parentTable = current.parent_table;
	if (parentTable != 'sys_sg_data_item' && parentTable != 'sys_sg_write_back_action_item')
		return;

	var originalQuery = current.parent.query_condition;
	var pattern = new RegExp('{{' + previous.name + '}}','g');
	var replacedQuery = originalQuery.replace(pattern, "{{" + current.name + "}}");
	if (replacedQuery == originalQuery)
		return;
	
	var gr = new GlideRecord(parentTable);
	gr.get(current.parent);
	if (!gr.isValidRecord())
		return;
	
	gr.setValue('query_condition', replacedQuery);
	gr.update();
})(current, previous);
