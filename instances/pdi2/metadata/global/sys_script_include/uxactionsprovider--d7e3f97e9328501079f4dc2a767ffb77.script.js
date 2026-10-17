var UxActionsProvider = Class.create();
UxActionsProvider.prototype = {
	getActions: function(current) {
		var tableName = String(current.table || '');
		if (tableName === '')
			return stringQueryPostfix;

		var tables = GlideDBObjectManager.getTables(tableName).toArray().concat();
		tables.push('global');

		var tableQuery = 'tableIN' + tables;
		var activeQuery = "^active=true";
		
		var formDeclarativeActionsQuery = tableQuery + activeQuery + "^action_type=declarative_action^declarative_actionISNOTEMPTY^declarative_action.model=360935e9534723003eddddeeff7b127d^declarative_action.form_position=action_bar";
		
		var formUiActionsQuery = tableQuery + activeQuery + "^action_type=ui_action^ui_actionISNOTEMPTY^ui_action.form_button_v2=true^ORui_action.form_menu_button_v2=true";

		return formDeclarativeActionsQuery + "^NQ" + formUiActionsQuery;
	},
	type: 'UxActionsProvider'
};
