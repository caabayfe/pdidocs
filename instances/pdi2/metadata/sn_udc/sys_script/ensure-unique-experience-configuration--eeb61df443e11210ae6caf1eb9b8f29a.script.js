(function executeRule(current, previous /*null when async*/) {
	var currentExperienceConfig = current.getValue('experience_configuration');
	var gr = ExperienceConfiguration.getExperienceVisibilityRecord(currentExperienceConfig);

	if (gr.getRowCount() > 0 && gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage('Experience configuration must be unique'));
		current.setAbortAction(true);
	}
})(current, previous);
