function onAfter(current, previous) {
	//This function will be automatically called when this rule is processed.
	var direction = current.direction;
	var direction_string = "not set";
	if (direction == 2 || direction == 3)
		direction_string = "to " + direction.getDisplayValue().toLowerCase();

	var indicator_source_name;
	var conditions;
	var facts_table;

	var rec = new GlideRecord("pa_cubes");
	if (rec.get(current.cube)) {
		indicator_source_name = rec.getValue("name");
		conditions = rec.getElement("conditions").getDisplayValue();
		facts_table = rec.getValue("facts_table");
	}

	var additional_conditions = current.conditions;

	var message = "{0} is measured {1} as unit {2}.\nThe goal for this indicator is {3}.\nIt is the {4} on data source {5}, which is using the table: \n{6}\nwith the following conditions:\n{7}";

	var parameters = [current.name, current.frequency.getDisplayValue().toLowerCase(), current.unit.getDisplayValue(), direction_string, current.aggregate.getDisplayValue().toLowerCase(), indicator_source_name, facts_table, conditions];

	if (additional_conditions) {
		message += "\nAdditional conditions:\n{8}";
		parameters.push(additional_conditions.getDisplayValue());
	}

	var description = gs.getMessage(message, parameters);

    // Fetch the indicator again to refresh the value of "id" and thereby to avoid UniqueConstraint error from DB
	var indicator = new GlideRecord(current.getTableName());
	if (indicator.get(current.sys_id)) {
		indicator.setValue('description', description);
		indicator.update();
	}
}
