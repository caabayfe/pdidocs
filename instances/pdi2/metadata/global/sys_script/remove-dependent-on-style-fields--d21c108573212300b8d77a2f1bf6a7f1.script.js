(function executeRule(current, previous /* null when async */) {
	var cascadeEraser = new CascadeEraser();
	cascadeEraser.removeDependentValueFromListField('tag_style',current.sys_id ,'sys_sg_map_screen');	
	cascadeEraser.removeDependentValueFromListField('ui_styles',current.sys_id ,'sys_sg_item_view');
})(current, previous);
