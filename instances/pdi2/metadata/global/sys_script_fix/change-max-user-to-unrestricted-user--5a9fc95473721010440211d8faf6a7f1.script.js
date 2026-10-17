// Update hints and sys_choices that say "Max-User" to say "Unrestricted User" instead
fixHint("license_details", "license_type");
fixHint("license_details_deleted", "license_type");
fixChoice("license_details", "license_type");
fixChoice("license_details_deleted", "license_type");

// Find sys_documentation for the given table and column and update its hint to say "Unrestricted User"
function fixHint(table, column) {
	// New hint to use for the sys_documentation record
	var updated = "The type of the subscription, Per-User for user subscriptions, Capacity for data driven subscriptions, Unrestricted User for subscriptions capped by the maximum user count";

	var docsGR = new GlideRecord("sys_documentation");
	docsGR.addQuery("name", table);
	docsGR.addQuery("element", column);
	docsGR.addQuery("language", "en");
	docsGR.query();

	if (!docsGR.next()) {
		gs.info("Unable to find sys_documentation for " + table + "." + column);
		return;
	}

	docsGR.setValue("hint", updated);
	if (docsGR.update())
		gs.info("Updated " + table + "." + column + " hint to say 'Unrestricted User'");
	else
		gs.info("Failed to update " + table + "." + column + " hint");
}

// Find the "Max-User" sys_choice for the given table and column and update it to say "Unrestricted User"
function fixChoice(table, column) {
	var choiceGR = new GlideRecord("sys_choice");
	choiceGR.addQuery("name", table);
	choiceGR.addQuery("element", column);
	choiceGR.addQuery("language", "en");
	choiceGR.addQuery("value", 2); // Value of "Max-User" license type
	choiceGR.query();

	if (!choiceGR.next()) {
		gs.info("Unable to find sys_choice for " + table + "." + column);
		return;
	}

	choiceGR.setValue("label", "Unrestricted User");
	if (choiceGR.update())
		gs.info("Updated " + table + "." + column + " choices to say 'Unrestricted User'");
	else
		gs.info("Failed to update " + table + "." + column + " choice");
}
