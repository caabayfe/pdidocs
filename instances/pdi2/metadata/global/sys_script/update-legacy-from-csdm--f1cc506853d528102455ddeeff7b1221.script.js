(function executeRule(current, previous /*null when async*/) {
	
	var util = new LifeCycleUtil();
	if(!util.isClassExcludedFromSync(current)){
		var callingTable = current.sys_class_name + '';
		new LifeCycleUtil().updateFromCSDM(callingTable, current);
	}
	
})(current, previous);
