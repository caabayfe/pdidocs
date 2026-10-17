var TableColumns = Class.create();
TableColumns.prototype = {
	/**
	 * @param {string} - table name
	 * @param {string} - view name
	 */
	initialize(table, view) {
		this.table = table;
		this.view = view || 'default';
	},

	getColumnProps() {
		var columns = new ListViewManager(
			this.table,
			this.view
		).getListElements();
		var gr = TBQueries.getGivenColumnRecordsForTable(this.table, columns);
		var props = [];

		while (gr.next()) {
			var prop = {};
			prop.label = gr.getDisplayValue('column_label');
			prop.name = gr.getValue('element');
			var typeRecord = gr.internal_type.getRefRecord();
			prop.internalType = typeRecord ? typeRecord.getValue('name') : '';
			prop.primitiveType = typeRecord
				? typeRecord.getValue('scalar_type')
				: '';
			prop.active = gr.getDisplayValue('active');

			props.push(prop);
		}

		// sort result based on columns array
		props.sort(function (a, b) {
			return columns.indexOf(a.name) - columns.indexOf(b.name);
		});

		return props;
	},

	type: 'TableColumns',
};
