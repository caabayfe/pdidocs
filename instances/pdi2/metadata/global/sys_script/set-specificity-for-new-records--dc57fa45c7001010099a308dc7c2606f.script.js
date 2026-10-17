(function executeRule(current, previous /*null when async*/) {
	var tableCalc = current.table == 'global' ? 0 : GlideDBObjectManager.getTables(current.table).size();
	var tablePoints = 10 * tableCalc;
	var viewPoints = current.view ? 2 : 0;
	var workspacePoints = current.workspace ? 1 : 0;
	current.setValue("specificity", tablePoints + viewPoints + workspacePoints);
})(current, previous);
