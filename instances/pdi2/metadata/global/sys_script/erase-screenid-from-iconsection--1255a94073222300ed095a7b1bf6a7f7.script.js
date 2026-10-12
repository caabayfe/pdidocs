(function executeRule(current, previous) {

	var cascadeEraser = new CascadeEraser();
	cascadeEraser.removeDependentValueFromListField('applets', current.sys_id ,'sys_sg_icon_section');

})(current, previous);
