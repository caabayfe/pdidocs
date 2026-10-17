var UxActionLayoutItemProvider = Class.create();

function getQuery(actionLayout) {
    var selectedTable = actionLayout ? actionLayout.table : '';
	var stringQueryPostfix = '^active=true';

	var tableName = String(selectedTable || '');
	if (tableName === '')
		return stringQueryPostfix;

	var tables = GlideDBObjectManager.getTables(table).toArray().concat();
	tables.push('global');
	return 'tableIN' + tables + stringQueryPostfix;
}

UxActionLayoutItemProvider.prototype = {
    initialize: function() {
    },
	getAction: function(current) {
		return getQuery(current.action_layout);
	},
	getGroup: function(current) {
		return getQuery(current.action_layout);
	},
    type: 'UxActionLayoutItemProvider'
};
