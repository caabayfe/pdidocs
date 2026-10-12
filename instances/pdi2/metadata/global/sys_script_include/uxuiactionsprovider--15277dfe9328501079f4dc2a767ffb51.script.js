var UxUIActionsProvider = Class.create();
UxUIActionsProvider.prototype = {
	getActions: function(current) {
		var stringQueryPostfix = '^active=true^form_button_v2=true^ORform_menu_button_v2=true';
		var tableName = String(current.table || '');
		if (tableName === '')
			return stringQueryPostfix;

		var tables = GlideDBObjectManager.getTables(tableName).toArray().concat();
		tables.push('global');
		return 'tableIN' + tables + stringQueryPostfix;
	},
	type: 'UxUIActionsProvider'
};
