var GetTableHavingReferenceToGivenTable = Class.create();
GetTableHavingReferenceToGivenTable.prototype = {
    initialize: function() {},
    process: function(tableName) {
        tableName = gs.nil(tableName) ? current.table : tableName;
        var tables = [];

        var gr = new GlideRecordSecure('sys_dictionary');
        gr.addQuery('reference', tableName);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var g = new GlideRecordSecure(gr.name);
            if (g.getLabel() !== '') {
                tables.push(gr.name.toString());
            }
        }
        return tables;
    },
    type: 'GetTableHavingReferenceToGivenTable'
};
