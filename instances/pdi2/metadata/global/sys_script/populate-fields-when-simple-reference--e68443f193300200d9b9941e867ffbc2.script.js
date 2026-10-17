(function executeRule(current, previous /*null when async*/) {

	var table = current.basic_query_from.toString();
	var field = current.reference_field.toString();
	var gr = new GlideRecord(table);
	var element = gr.getElement(field);
	var reference = element.getReferenceTable();
	current.basic_apply_to = reference;
	current.query_with = "current.addQuery('" + field + "', parent.sys_id);";

})(current, previous);
