function transform(input) {
	var result = {};
	var templateId = input.templateSysId;
	var taskId = input.taskId;

	result = sn_cmdb.DuplicateTemplate.remediateTask(templateId, taskId);
	return result; 
}
