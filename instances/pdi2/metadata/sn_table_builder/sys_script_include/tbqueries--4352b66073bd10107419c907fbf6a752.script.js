var TBQueries = Class.create();

// Gets all table names in the hierarchy
TBQueries.getTables = function (table) {
	var gr = new GlideTableHierarchy(table);
	return gr.getTables();
};

TBQueries.getQueryForColumns = function (table, excludeTableFilter) {
	return TBUtil.prepConditionalQuery(
		'element!=NULL',
		'active=true',
		excludeTableFilter
			? ''
			: 'nameIN' + TBQueries.getTables(table).join(',')
	);
};

TBQueries.getGivenColumnRecordsForTable = function (table, columns) {
	var gr = new GlideRecord(TBConstants.SYS_CLASS_DICTIONARY);
	gr.addQuery('element', 'IN', columns.join(','));
	gr.addQuery('name', 'IN', TBQueries.getTables(table).join(','));
	gr.query();
	return gr;
};

TBQueries.prototype = {
	initialize() {},

	type: 'TBQueries',
};
