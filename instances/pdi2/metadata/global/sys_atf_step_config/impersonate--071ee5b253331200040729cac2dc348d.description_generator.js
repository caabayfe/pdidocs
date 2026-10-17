(function generateDescription(step) {
	if (step.inputs.user.hasMapping())
		return gs.getMessage("Impersonate the user: {0}", step.inputs.user.getDisplayValue());

	var userGR = new GlideRecord("sys_user");
	userGR.get(step.inputs.user);
	var description = gs.getMessage("Impersonate the user: {0} with user Id: {1}", [userGR.getDisplayValue(), userGR.getValue("user_name")]);

	if (step.warning_message)
		return description += "\n\n" + step.warning_message;

	return description;
})(step);
