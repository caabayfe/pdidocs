var TBTableExtensionsAPI = Class.create();
TBTableExtensionsAPI.prototype = {
	initialize(table) {
		this.table = table;
	},

	build() {
		var res = this._validate();

		if (res.isValid) {
			var result = {
				isExtended: false,
			};
			var gr = new GlideTableHierarchy(this.table);
			var isExtended = gr.hasExtensions();
			if (isExtended) {
				var extendingTables = gr.getTableExtensions();
				result.isExtended = true;
				result.tables = extendingTables;
			}
			return result;
		}
		return TBUtil.error(res);
	},

	_validate() {
		var res = Validators.isValidTableRecord(this.table);

		if (!res.isValid) {
			res.message = gs.getMessage('No record found');
		}

		return res;
	},

	type: 'TBTableExtensionsAPI',
};
