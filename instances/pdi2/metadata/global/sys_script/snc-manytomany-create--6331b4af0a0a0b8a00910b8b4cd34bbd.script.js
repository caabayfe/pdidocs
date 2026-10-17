createMTMTable();

function createMTMTable() {
	if (exists()) {
		current.setAbortAction(true);
		current.m2m_table.setError(gs.getMessage("A Many to Many entry already exists for this table"));
		return;
	}

	if (MTMexists()) {
		gs.addInfoMessage(gs.getMessage("The many to many table {0} already exists", current.m2m_table));
		return;
	}

	createTable();
}

// check for duplicate entry on the many to many table name
function exists() {
	var chk = new GlideRecord('sys_m2m');
	chk.addQuery('m2m_table', current.m2m_table);
	chk.query();
	return chk.hasNext();
}

// check to see if the many to many table already exists
function MTMexists() {
	return gs.tableExists(current.m2m_table);
}

// create the many to many table needed for this sys_m2m entry
function createTable() {
	var tableLabel = getM2MTableLabel();
	current.m2m_table = gs.tableCreate(current.m2m_table, tableLabel);

	var to = GlideDBUtil.createElement(current.m2m_table, current.m2m_from_label,
		current.m2m_to_field, 'reference', '', current.to_table, true);
	var from = GlideDBUtil.createElement(current.m2m_table, current.m2m_to_label,
		current.m2m_from_field, 'reference', '', current.from_table, true);
	current.m2m_from_field = from.getName();
	current.m2m_to_field = to.getName();

	gs.addInfoMessage(gs.getMessage("Many to Many table {0} has been created", current.m2m_table));
}

function getM2MTableLabel() {
	var tableName = current.m2m_table;
	var scope = tableName.substring(0, tableName.indexOf("m2m"));
	return scope + "m2m_" + getLabels();
}

function getLabels() {
	var fromLabel = current.m2m_from_label;
	var toLabel = current.m2m_to_label;
	if (fromLabel.length + toLabel.length >= 25) {
		if (fromLabel.length > 12)
			fromLabel = trimLabel(fromLabel);
		if (toLabel.length > 12)
			toLabel = trimLabel(toLabel);
	}
	return toLabel + "_" + fromLabel;
}

function trimLabel(label) {
	if (label.charAt(12) === '_' || label.charAt(12) === ' ')
		return label.substr(0, 11);
	return label.substr(0, 12);
}
