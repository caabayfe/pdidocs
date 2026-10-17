function transform(input) {
	var {tableName} = input;
	if(!tableName) return;
	
	var rulesAPI = new sn_data_management_console.RulesAPI();
	var references = rulesAPI.getReferences(tableName);

	var gr = new GlideRecord('sys_archive');
	var archiveRules = [];
	gr.query();
	while (gr.next()) {
		archiveRules.push({id: gr.getValue('sys_id'), label: gr.getValue('name'), table: gr.getValue('table')});
	}
	return {references, archiveRules};
}
