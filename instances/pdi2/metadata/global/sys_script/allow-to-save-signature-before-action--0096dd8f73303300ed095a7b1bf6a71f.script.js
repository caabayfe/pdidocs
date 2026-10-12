(function executeRule(current, previous) {

	if(!current.write_back_action_item || !(current.write_back_action_item.type.equals("script"))) {
		gs.addErrorMessage(gs.getMessage("Save signature before action execution is not allowed unless action item type is script!"));
		current.save_signature_before_action_execution = false;
	}
})(current, previous);
