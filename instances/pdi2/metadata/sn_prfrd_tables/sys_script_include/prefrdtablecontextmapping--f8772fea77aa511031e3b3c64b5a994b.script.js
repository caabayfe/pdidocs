var PrefrdTableContextMapping = Class.create();
PrefrdTableContextMapping.prototype = {
	initialize: function (options, additionalArgs) {
		this.options = options;
		this.gr = new GlideRecord('sn_preferred_table_context_mapping');
		this.additionalArgs = additionalArgs || {};
	},

	_getContextSysId: function (contextName) {
		var sysIds = [];
		var context = new GlideRecord('sn_preferred_table_context');
		context.addQuery('name', contextName);
		context.query();
		while (context.next()) {
			sysIds.push(context.getValue('sys_id'));
		}
		return sysIds[0];
	},

	_getTableDetails: function (tableName) {
		var tables = [];
		var tableRec = new GlideRecord('sys_db_object');
		tableRec.addQuery('name', tableName);
		if (this.options.context && this.options.context.toLowerCase() === 'extension') {
			tableRec.addQuery('is_extendable', 'true');
		}
		tableRec.query();
		while (tableRec.next()) {
			if(tableRec.isValid()) {
				var table = {
					sys_id: tableRec.getUniqueValue(),
					is_extendable: tableRec.getDisplayValue('is_extendable'),
					label: tableRec.getDisplayValue('label'),
				};
				tables.push(table);
			}
		}
		return tables;
	},

	_getPreferredTableDetails: function (sysId) {
		var prefrdTables = [];
		var prTableRec = new GlideRecord('sn_preferred_table');
		prTableRec.addQuery('sys_id', sysId);
		prTableRec.query();
		var inScopeTbSysIds = this.additionalArgs.inScopeTbSysIds ? this.additionalArgs.inScopeTbSysIds : [];
		while (prTableRec.next()) {
			var tbDetail = this._getTableDetails(
				prTableRec.getValue('table')
			)[0];
			if(tbDetail && inScopeTbSysIds.indexOf(tbDetail.sys_id) < 0) {
				var table = {
					sys_id: tbDetail.sys_id,
					name: prTableRec.getValue('table'),
					label: tbDetail.label,
					description: prTableRec.getDisplayValue('description'),
					short_description: prTableRec.getDisplayValue('short_description'),
					is_extendable: tbDetail.is_extendable,
				};
				prefrdTables.push(table);
			}
		}
		return prefrdTables;
	},

	_addAdditionalQueries: function () {
		var queryParams = this.options;
		var gr = this.gr;
		gr.orderBy('order'); //default sequence by order field
	},
	build: function () {
		var preferred_table_list = [];
		var preferred_table_names = [];
		this.gr.addQuery(
			'context',
			this._getContextSysId(this.options.context)
		);
		this._addAdditionalQueries();
		this.gr.query();
		while (this.gr.next()) {
			var prfrdTables = this._getPreferredTableDetails(
				this.gr.getValue('preferred_table')
			)[0];
			if (prfrdTables) {
				prfrdTables.order = this.gr.getValue('order');
				preferred_table_list.push(prfrdTables);
				preferred_table_names.push(prfrdTables.name);
			}
		}
		return {'tables': preferred_table_list, 'names': preferred_table_names};
	},

	type: 'PrefrdTableContextMapping',
};
