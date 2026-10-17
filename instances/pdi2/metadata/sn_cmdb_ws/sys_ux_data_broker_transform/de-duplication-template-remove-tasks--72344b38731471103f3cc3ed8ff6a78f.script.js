function transform(input) {
	var result = {};
	var taskIds = input.taskIds.split(',');

	var util = new global.CMDBDuplicateTemplateUtils();
	result = util.removeTemplateFromTasks(taskIds); 
	return result; 
}
