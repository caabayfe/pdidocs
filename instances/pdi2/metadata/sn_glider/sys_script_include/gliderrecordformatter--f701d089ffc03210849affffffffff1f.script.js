var GliderRecordFormatter = Class.create();
GliderRecordFormatter.prototype = {
	initialize: function () {},
	format: function (gr, content) {
		var formatted = {
			name: gr.getDisplayValue() || gr.name || gr.getRecordClassName() + '_' + gr.getUniqueValue(),
			sysId: gr.getUniqueValue(),
			tableLabel: gr.getClassDisplayValue(),
			tableName: gr.getRecordClassName()
		};

		if (content) {
			formatted['content'] = content;
		}

		return formatted;
	},
	type: 'GliderRecordFormatter'
};
