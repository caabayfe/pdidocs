(function executeRule(current, previous /*null when async*/) {

	var buttonTemplateRecord = new GlideRecord("sys_sg_button");
	if (current.template != 'NULL' && (current.type == 'new' || current.type == 'update')) {
		buttonTemplateRecord.addQuery('write_back_action_item', current.getUniqueValue());
		buttonTemplateRecord.addQuery('offline', 'true');
		buttonTemplateRecord.query();
		buttonTemplateRecord.offline_template_field_table = current.table;
		buttonTemplateRecord.offline_template_field = current.template;
		buttonTemplateRecord.updateMultiple();
	}
	
})(current, previous);
