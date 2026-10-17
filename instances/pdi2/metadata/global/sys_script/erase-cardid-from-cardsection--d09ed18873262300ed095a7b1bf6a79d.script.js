(function executeRule(current, previous) {

	var cascadeEraser = new CascadeEraser();
	cascadeEraser.removeDependentValueFromListField('cards',current.sys_id ,'sys_sg_card_section');

})(current, previous);
