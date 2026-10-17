(function executeRule(current, previous /*null when async*/) {
	
	if (!current.identifier || !current.attributes)
		return;
	if (current.active == false || current.identifier.active == false)
		return;

	var columns = current.attributes.split(',');
	var appliesTo = current.table;
	if (!appliesTo)
		return;
	
	if (!GlideTableDescriptor.isValid(appliesTo)) {
		gs.logWarning("Index not created for attributes '" + current.attributes + "' as table '" + appliesTo + "'doesn't yet exist");
		return;
	}
	
	var grAppliesTo = new GlideRecord(appliesTo);
	for (var i in columns) {
		var column = columns[i];
		var elem = grAppliesTo.getElement(column);
		if (elem != null) {
			var table = elem.getTableName();
			var index = new IndexCreator(table, column, false, null, "identification");
			index.schedule();
		}
	}
	
})(current, previous);
