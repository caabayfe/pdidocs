(function executeRule(current, previous /*null when async*/) {
	var specificity = 10 * GlideDBObjectManager.getTables(current.table).size();
	current.setValue('specificity', specificity);
})(current, previous);
