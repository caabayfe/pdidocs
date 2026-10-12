function transform(input) {
	/*
		Given the template sys ID,
		return the de-duplication task sys ID's that match the template's task conditions
	*/
	var result = {};
	var template = input.templateSysId;

	var items = (new GetDedupeTaskInfo()).getMatchingTasks(template);
	
	result = {'items': items,
		'template': template};
	return result;
}
