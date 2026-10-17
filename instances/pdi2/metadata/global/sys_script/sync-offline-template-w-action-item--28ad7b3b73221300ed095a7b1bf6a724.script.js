(function executeRule(current, previous /*null when async*/) {
	if (current.write_back_action_item == 'NULL') {
		current.offline_template_field_table = 'NULL';
		current.offline_template_field = 'NULL';
		return;
	}

	var action_item_type = current.write_back_action_item.type;
	if (action_item_type == 'update' || action_item_type == 'new') {
		current.offline_template_field_table = current.write_back_action_item.table;
		current.offline_template_field = current.write_back_action_item.template;		
	}
})(current, previous);
