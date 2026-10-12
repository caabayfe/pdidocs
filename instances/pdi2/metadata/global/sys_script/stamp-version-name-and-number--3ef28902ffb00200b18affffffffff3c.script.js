function onBefore(current, previous) {
	var util = new StdChangeUtils();

	if (current.version.nil()) // If for some reason admin wants to create this record,
								// then let him also specify a version.
		current.version = util.getVersionNumber(current);

	if (current.name.nil()) // If for some reason admin wants to create this record,
							// then let him also specify a version.
		current.name = util.getVersionName(current);
}
