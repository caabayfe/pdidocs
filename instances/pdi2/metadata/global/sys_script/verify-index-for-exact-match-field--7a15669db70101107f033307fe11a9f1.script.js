(function executeRule(current, previous /*null when async*/) {

	var dbObject = new GlideRecord('sys_db_object');
	dbObject.addQuery('name', current.table_name);
	dbObject.query();
	dbObject.next();
	var tableID = dbObject.getUniqueValue();

	var columnAliases = [current.getValue('column')];
	var aliasesGr = new GlideRecord('sys_storage_alias');
	aliasesGr.addQuery('table_name', current.table_name);
	aliasesGr.addQuery('element_name', current.column);
	aliasesGr.query();
	while (aliasesGr.next())
		columnAliases.push(aliasesGr.getValue('storage_alias'));

	var indexesGr = new GlideRecord('v_index_creator');
	indexesGr.addQuery('table', tableID);
	indexesGr.query();

	var indexFound = false;
	while (indexesGr.next()) {
		var indexColumnList = indexesGr.getValue('index_col_name');
		if (gs.nil(indexColumnList))
			continue;

		var indexColumn = indexColumnList.split(',')[0].trim();
		if (columnAliases.includes(indexColumn)) {
			indexFound = true;
			break;
		}
	}

	if (!indexFound) {
		gs.addErrorMessage(gs.getMessage("Cannot create a matcher for a field that does not have a Database Index : {0} . {1}", [GlideStringUtil.escapeHTML(current.table_name), GlideStringUtil.escapeHTML(current.column)]));
		current.setAbortAction(true);
	}

})(current, previous);
