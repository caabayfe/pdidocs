(function executeRule(current, previous /*null when async*/) {
	var tablePoint = 10 * GlideDBObjectManager.getTables(current.table).size();
	var specificity = tablePoint + Boolean(current.workspace);
	current.setValue("specificity", specificity);
})(current, previous);
