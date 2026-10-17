(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('ais_rule_mirror_m2m');
	gr.addQuery('mirror_target', current.getValue('mirror_target'));
	gr.addQuery('mirror_source', current.getValue('mirror_source'));
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("The source profile is already mirrored for the target profile"));
		current.setAbortAction(true);
	}
})(current, previous);
