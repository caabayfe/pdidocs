(function executeRule(current, previous /*null when async*/) {

	var cascadeEraser = new CascadeEraser();
	cascadeEraser.removeDependentValueFromListField('layout',current.sys_id ,'sys_sg_applet_launcher');

})(current, previous);
