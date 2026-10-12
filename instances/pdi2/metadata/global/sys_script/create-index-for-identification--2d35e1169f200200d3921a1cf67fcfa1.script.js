function onAfter(current, previous) {
    //This function will be automatically called when this rule is processed.
    if (!current.identifier || !current.attributes)
        return;
	
	var appliesTo = current.table ? current.table : current.identifier.applies_to;
	// index ci attributes for current.table
	addIndex(appliesTo, current.attributes);
	
	// do the indexing for hybrid rules if we have a hybrid rule
	if (current.table != current.identifier.applies_to) {
		addIndex(current.identifier.applies_to, current.hybrid_entry_ci_criterion_attributes);
	}
}

function addIndex(tableName, attributes) {
	
    if (!attributes) {
	    return;
    }
	
    if (!tableName)
        return;
	
    var columns = attributes.split(',');

    var grAppliesTo = new GlideRecord(tableName);
    for (var i in columns) {
        var column = columns[i];
        var table = grAppliesTo.getElement(column).getTableName();
        var index = new IndexCreator(table, column, false, null, "identification");
        index.schedule();
    }
}
