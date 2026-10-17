var ReferenceFieldsList = Class.create();
ReferenceFieldsList.prototype = {
    initialize: function() {
    },

	process: function(tableName) {
		var fields = [];
		if (!GlideTableDescriptor.get('sys_dictionary').isValid()) {
		    gs.warn("sys_dictionary does not exist");
            return fields;
		}
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('name', tableName);
		var condition = gr.addQuery('internal_type', '=', 'reference');
		gr.appendOrQuery(condition, 'internal_type', '=', 'document_id');
		gr.query();
		while (gr.next()) {
			fields.push(gr.getValue('element'));
		}
		return fields;
	},

    type: 'ReferenceFieldsList'
};
