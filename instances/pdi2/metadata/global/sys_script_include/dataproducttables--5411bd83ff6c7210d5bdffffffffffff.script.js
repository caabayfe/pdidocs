var DataProductTables = Class.create();
DataProductTables.prototype = {
    initialize: function() {},

    process: function() {
        var dictGr = new GlideRecordSecure('sys_dictionary');
        dictGr.addQuery('attributes', 'CONTAINS', 'update_synch');
        dictGr.addQuery('internal_type', '=', 'collection');
        dictGr.query();
        var tableNames = [];
        while (dictGr.next()) {
            tableNames.push(dictGr.name.toString());
        }
        return tableNames;
    },


    type: 'DataProductTables'
};
