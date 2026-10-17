(function executeRule(current, previous /*null when async*/) {
	var availableForRoles = current.getValue(ExperienceConfiguration.Column.AvailableForRoles);
	var notAvailableForRoles = current.getValue(
		ExperienceConfiguration.Column.NotAvailableForRoles
	);

	if (!availableForRoles && !notAvailableForRoles) {
		var availableForRolesColumnLabel = current
			.getElement(ExperienceConfiguration.Column.AvailableForRoles)
			.getLabel();
		var notAvailableForRolesColumnLabel = current
			.getElement(ExperienceConfiguration.Column.NotAvailableForRoles)
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
