var UxM2mActionLayoutItemProvider = Class.create();
UxM2mActionLayoutItemProvider.prototype = {
	/**
	 * Returns the hierarchy of tables extended from the given table
	 * Ex: incident -> incident, task, global
	 */
	getTableAncestors: function(tableName) {
		if (!tableName) return [];

		var tables = GlideDBObjectManager.get().getTables(tableName).toArray().concat();
		tables.push('global');
		return tables;
	},

	/**
	 * Returns all tables that descend from the given table
	 * Ex: task -> task, incident, problem, etc.
	 */
	getTableDescendants: function(tableName) {
		if (!tableName) return [];

		return GlideDBObjectManager.get().getAllExtensions(tableName).toArray().concat();
	},

	/**
	 * Generates the query string used to locate active records with matching tables
	 */
	generateQuery: function(tables) {
		var stringQueryPostfix = '^active=true';
		if (!tables.length)
			return stringQueryPostfix;

		return 'tableIN' + tables + stringQueryPostfix;
	},

	/**
	 * Items will apply to layouts that are equally or less specific than the layout's table.
	 * Ex: an incident layout contains incident, task, or global items.
	 */
	getItemQueryForLayout: function() {
		var layoutTable;

		if (current && current.ux_form_action_layout) layoutTable = current.ux_form_action_layout.table;
		else if (parent) layoutTable = parent.table;

		return this.generateQuery(this.getTableAncestors(layoutTable));
	},

	/**
	 * Layouts will apply to items that are equally or more specific than the items's table.
	 * Ex: a task item will is contained by task or incident layouts.
	 */
	getLayoutQueryForItem: function() {
		var itemTable;

		if (current && current.ux_form_action_layout_item) itemTable = current.ux_form_action_layout_item.table;
		else if (parent) itemTable = parent.table;

		if (itemTable && itemTable.toString() === "global") return "active=true";

		return this.generateQuery(this.getTableDescendants(itemTable));
	},
	type: 'UxM2mActionLayoutItemProvider'
};
