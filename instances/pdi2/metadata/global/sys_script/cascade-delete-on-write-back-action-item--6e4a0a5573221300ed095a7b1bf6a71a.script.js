(function executeRule(current, previous /*null when async*/) {

	var cascadeEraser = new CascadeEraser();
	cascadeEraser.deleteByParentId(current.sys_id, 'sys_sg_item_parameter');

})(current, previous);
