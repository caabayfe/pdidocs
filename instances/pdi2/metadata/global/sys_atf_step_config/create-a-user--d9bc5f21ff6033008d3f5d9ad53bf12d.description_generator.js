(function generateDescription(step) {
	var fieldValues = step.inputs.field_values;
	var firstName = step.inputs.first_name;
	var lastName = step.inputs.last_name;

	var description;
	if (step.inputs.impersonate)
		description = gs.getMessage("Create and impersonate user with the following values:\n");
	else
		description = gs.getMessage("Create user with the following values:\n");

	var descriptionGenerator = new ATFStepDescriptionGenerator();
	description += descriptionGenerator.getUserConditionDescription(fieldValues, firstName, lastName);

	if (step.inputs.roles.hasMapping())
		description += gs.getMessage("\nWith roles: {0}", step.inputs.roles.getDisplayValue());
	else if (step.inputs.roles != "") {
		var roleNames = "";
		var roleIds = step.inputs.roles.split(",");
		var rolesGR = new GlideRecord("sys_user_role");
		rolesGR.addQuery("sys_id", "IN", roleIds);
		rolesGR.query();
		while (rolesGR.next()) {
			if (roleNames == "")
				roleNames += rolesGR.getValue("name");
			else
				roleNames += ", " + rolesGR.getValue("name");
		}
		description += gs.getMessage("\nWith roles: {0}", roleNames);
	}

	if (step.inputs.groups.hasMapping())
		description += gs.getMessage("\nWith groups: {0}", step.inputs.groups.getDisplayValue());
	else if (step.inputs.groups != "") {
		var groupNames = "";
		var groupIds = step.inputs.groups.split(",");
		var groupGR = new GlideRecord("sys_user_group");
		groupGR.addQuery("sys_id", "IN", groupIds);
		groupGR.query();
		while (groupGR.next()) {
			if (groupNames == "")
				groupNames += groupGR.getValue("name");
			else
				groupNames += ", " + groupGR.getValue("name");
		}
		description += gs.getMessage("\nWith groups: {0}", groupNames);
	}

	return description;
})(step);
