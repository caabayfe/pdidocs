(function executeRule(current, previous /*null when async*/) {

	var tableCalc = current.table == 'global' ? 0 : GlideDBObjectManager.getTables(current.table).size();
	var tablePoints = 10 * tableCalc;
	var actionConfigPoints = current.action_config ? 10 : 0;
	current.setValue("specificity", tablePoints + actionConfigPoints);
})(current, previous);
