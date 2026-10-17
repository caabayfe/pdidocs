(function executeRule(current, previous /*null when async*/) {
	var experienceType = current.getValue(ExperienceConfiguration.Column.ExperienceType);
	var isPluginAvailable =
		current.getValue(ExperienceConfiguration.Column.IsPluginAvailable) === '1';
	var experienceConfigGR = ExperienceConfiguration.getExperienceConfigBasedOnPluginAvailability(
		experienceType,
		isPluginAvailable
	);

	if (
		experienceConfigGR.getRowCount() > 0 &&
		experienceConfigGR.next() &&
		experienceConfigGR.getUniqueValue() != current.getUniqueValue()
	) {
		var experienceTypeLabel = current.getDisplayValue(
			ExperienceConfiguration.Column.ExperienceType
		);
		var errorMessage = isPluginAvailable
			? gs.getMessage('{0} already has a configuration with plugin', [experienceTypeLabel])
			: gs.getMessage('{0} already has a configuration without plugin', [
					experienceTypeLabel,
			  ]);

		gs.addErrorMessage(errorMessage);
		current.setAbortAction(true);
	}
})(current, previous);
