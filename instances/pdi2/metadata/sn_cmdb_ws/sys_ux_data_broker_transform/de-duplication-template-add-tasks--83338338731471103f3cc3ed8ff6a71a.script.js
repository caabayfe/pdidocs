function transform(input) {
	var result = {};
	var query = input.query;
	var templateId = input.templateSysId;
	var selectionQuery = input.selectionQuery;
	var taskIds = [];
	
	// query is the original query for the tasks list
	// selectionQuery is a query of the selected tasks
	
	var addTasksQuery = query + '^' + selectionQuery;
	var gr = new GlideRecord('reconcile_duplicate_task');
	gr.addEncodedQuery(addTasksQuery, true);
	gr.query();
	while(gr.next()){
		taskIds.push(gr.getValue('sys_id'));
	}

	var util = new global.CMDBDuplicateTemplateUtils();
	result = util.addTasksToTemplate(templateId, taskIds); 
	return result;  
}
