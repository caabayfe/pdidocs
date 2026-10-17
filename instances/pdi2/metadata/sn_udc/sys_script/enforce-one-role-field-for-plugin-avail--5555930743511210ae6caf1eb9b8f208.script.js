(function executeRule(current, previous /*null when async*/) {
	var availableForRoles = current.getValue(
		ExperienceConfiguration.Column.DefaultAvailableForRoles
	);
	var notAvailableForRoles = current.getValue(
		ExperienceConfiguration.Column.DefaultNotAvailableForRoles
	);

	if (!availableForRoles && !notAvailableForRoles) {
		var availableForRolesColumnLabel = current
			.getElement(ExperienceConfiguration.Column.DefaultAvailableForRoles)
			.getLabel();
		var notAvailableForRolesColumnLabel = current
			.getElement(ExperienceConfiguration.Column.DefaultNotAvailableForRoles)
			.getLabel();

		gs.addErrorMessage(
			gs.getMessage("Please specify either '{0}' or '{1}'", [
				availableForRolesColumnLabel,
				notAvailableForRolesColumnLabel,
			])
		);
		current.setAbortAction(true);
	}
})(current, previous);
