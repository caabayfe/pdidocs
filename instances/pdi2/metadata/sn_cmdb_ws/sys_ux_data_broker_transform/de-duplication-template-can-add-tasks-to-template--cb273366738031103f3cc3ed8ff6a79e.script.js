function transform(input) {
	var result = {};
	var taskIds = input.taskIds.split(',');
	var templateId = input.templateSysId;

	result = sn_cmdb.DuplicateTemplate.canAddTasksToTemplate(taskIds, templateId); 
	return result; 
}
