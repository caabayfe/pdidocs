(function executeRule(current, previous /*null when async*/) {
	if (current.name == 'sn_vsc.first_time_modal_user_preference.hide.modal_duration' && current.value <= 0) {
		gs.addErrorMessage(gs.getMessage("SC first time experience modal hide duration should be greater than 0 days"));
		current.setAbortAction(true);
	}
})(current, previous);
