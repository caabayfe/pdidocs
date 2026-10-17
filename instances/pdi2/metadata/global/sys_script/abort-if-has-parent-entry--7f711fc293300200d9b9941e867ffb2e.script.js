(function executeRule(current, previous /*null when async*/) {
	
	// abort if entry for the target related list has this relationship already
	var gr = new GlideRecord('sys_ui_related_list_entry');
	gr.addQuery('related_list', 'REL:' + current.sys_relationship.toString());
	gr.addQuery('list_id', current.sys_ui_related_list.toString());
	gr.query();
	if(gr.getRowCount() > 0) {
		gs.addInfoMessage(gs.getMessage("The '{0}' relationship is already assigned to the '{1}' related list", [current.sys_relationship.name.toString(), current.sys_ui_related_list.calculated_name.toString()]));
		current.setAbortAction(true);
	}

	if(current.sys_relationship.simple_reference.toString() !== 'true')
		return;
	
	// since relationship is a simple reference
	// abort if entry for the target related list has this reference already
	var table = current.sys_relationship.basic_query_from.toString();
	var field = current.sys_relationship.reference_field.toString();
	gr = new GlideRecord('sys_ui_related_list_entry');
	gr.addQuery('related_list', table + '.' + field);
	gr.addQuery('list_id', current.sys_ui_related_list.toString());
	gr.query();
	if(gr.getRowCount() > 0) {
		var td = GlideTableDescriptor.isValid(table) ? GlideTableDescriptor.get(table) : null;
		var tableLabel = td !== null ? td.getED().getLabel() : table;
		var fieldLabel = td !== null && td.isValidField(field) ? td.getElementDescriptor(field).getLabel() : field;
		gs.addInfoMessage(gs.getMessage("The reference field '{0}' on table '{1}' is already assigned to the '{2}' related list", [fieldLabel, tableLabel, current.sys_ui_related_list.calculated_name.toString()]));
		current.setAbortAction(true);
	}
	
})(current, previous);
