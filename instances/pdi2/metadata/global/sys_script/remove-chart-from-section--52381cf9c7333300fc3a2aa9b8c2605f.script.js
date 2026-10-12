(function executeRule(current, previous /*null when async*/) {
	var cascadeEraser = new CascadeEraser();
	cascadeEraser.removeDependentValueFromListField("charts", current.sys_id, "sys_sg_chart_section");	

})(current, previous);
