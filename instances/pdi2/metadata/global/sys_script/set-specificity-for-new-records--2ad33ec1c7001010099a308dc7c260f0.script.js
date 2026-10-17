(function executeRule(current, previous /*null when async*/) {

	var tablesCalc = current.table == 'global' ? 0 : GlideDBObjectManager.getTables(current.table).size(); 
	var specificity = Boolean(current.sys_domain) + tablesCalc * 10 + Boolean(current.view) + Boolean(current.workspace);
	
	current.setValue("specificity", specificity);

})(current, previous);
