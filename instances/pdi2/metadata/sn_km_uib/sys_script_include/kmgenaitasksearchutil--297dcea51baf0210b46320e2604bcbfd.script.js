var KMGenAITaskSearchUtil = Class.create();
KMGenAITaskSearchUtil.prototype = {
    initialize: function() {},

    getData: function(table, filters) {
        var data = {};
        var gr = new GlideRecord(table);
        gr.addEncodedQuery(filters.join('^OR'));
        gr.query();
        while (gr.next()) {
            data[gr.getUniqueValue()] = {
                'number': gr.getValue('number'),
                'short_description': gr.getValue('short_description'),
                'description': gr.getValue('description'),
                'close_notes': gr.getValue('close_notes')
            };
        }
        return data;
    },

    type: 'KMGenAITaskSearchUtil'
};
