var LicensingEngineTableDescriptor = Class.create();
LicensingEngineTableDescriptor.prototype = {
    initialize: function() {},

    /**
     * Return array of reference tables
     */
    getReferencedTables: function(tableName) {
        var tableSchema = GlideTableDescriptor.get(tableName).getSchemaList();
        var iterator = tableSchema.iterator();
        var reference_tables = [];
        while (iterator.hasNext()) {
            var ed = iterator.next();
            if (ed.isReference()) {
                var table_name = ed.getReference();
                reference_tables.push(table_name);
            }
        }
        return reference_tables;
    },

    isValid: function(tableName) {
        return GlideTableDescriptor.isValid(tableName);
    },

    type: 'LicensingEngineTableDescriptor'
};
