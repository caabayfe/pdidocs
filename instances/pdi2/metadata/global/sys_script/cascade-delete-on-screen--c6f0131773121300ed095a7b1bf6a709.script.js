(function executeRule(current, previous) {

	var cascadeEraser = new CascadeEraser();
	
	if (current.getTableName() == 'sys_sg_activity_stream_screen') {
		cascadeEraser.deleteBySysId(current.add_additional_comment, 'sys_sg_button');
		cascadeEraser.deleteBySysId(current.add_work_note, 'sys_sg_button');
	} else if (current.getTableName() == 'sys_sg_map_screen') 
		cascadeEraser.deleteByParentId(current.sys_id, 'sys_sg_screen');

	cascadeEraser.deleteByParentId(current.sys_id, 'sys_sg_button_instance');

})(current, previous);
