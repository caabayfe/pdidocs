function getKBMandatoryFields() {
	// get a list of fields that are on the knowledge form except the ones we dont want,
	// such as system fields
	var query = 'GOTOname=kb_knowledge^element!=sys_created_on^element!=sys_created_by^';
		query += 'element!=sys_updated_on^element!=sys_updated_by^element!=sys_id^element!=sys_mod_count';
		query += '^element!=number^element!=sys_class_name^element!=kb_knowledge_base';
		query += '^element!=category^element!=topic^element!=workflow_state^element!=sys_domain';
	
	// get all column names and labels from sys_dictionary
	var gr = new GlideRecord('sys_dictionary');
	gr.addEncodedQuery(query);
	gr.query();
	
	// add all of the fields to the answer choice list to be used
	// in the kb_knowledge_base mandatory_fields slushbucket
	while(gr.next()) {
		answer.add(gr.element, gr.column_label);
	}
}
