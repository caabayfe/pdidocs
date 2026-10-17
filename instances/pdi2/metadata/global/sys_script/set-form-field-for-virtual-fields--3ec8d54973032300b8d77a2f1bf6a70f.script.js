(function executeRule(current, previous /*null when async*/) {

	if(current.type == 'attachments_list' || current.type == 'check_list')
		current.data_item_field_name = current.field_name;

})(current, previous);
