(function executeRule(current, previous /*null when async*/) {


	var tablesCalc = current.table == 'global' ? 0 : GlideDBObjectManager.getTables(current.table).size(); 
	var specificity = tablesCalc * 10;
	current.setValue("specificity", specificity);

})(current, previous);
