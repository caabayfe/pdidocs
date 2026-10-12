var TBDeleteRecords = Class.create();
TBDeleteRecords.prototype = {
	initialize(table) {
		this.table = table;
	},

	build() {
		var gr = new GlideRecord(this.table);
		var canDelete = gr.canDelete();
		if (canDelete) {
			gr.query();
			if (gr.next()) gr.deleteMultiple();
			return {
				message: gs.getMessage('Records deleted successfully'),
			};
		} else {
			return {
				canDelete: false,
				message: gs.getMessage(
					'You do not have permission to delete this data.'
				),
			};
		}
	},

	type: 'TBDeleteRecords',
};
