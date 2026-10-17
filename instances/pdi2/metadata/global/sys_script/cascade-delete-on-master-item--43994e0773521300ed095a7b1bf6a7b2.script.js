(function executeRule(current, previous) {

	var cascadeEraser = new CascadeEraser();
	cascadeEraser.deleteByParentId(current.sys_id, 'sys_sg_screen');
	cascadeEraser.deleteByParentId(current.sys_id, 'sys_sg_button_instance');

})(current, previous);
