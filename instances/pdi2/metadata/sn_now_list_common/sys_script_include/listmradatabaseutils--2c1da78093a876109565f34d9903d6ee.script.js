var ListMRADatabaseUtils = Class.create();
ListMRADatabaseUtils.prototype = {
    initialize: function() {},

    getEveryParentTableRecursively: function(tableName) {
        var result = [];
        this._getParentTables(tableName, result);
        return result;
    },

    _getParentTables: function(tableName, result) {
        var tableHierarchy = new GlideTableHierarchy(tableName);

        var parent = tableHierarchy.getBase();
        // Recursively find and add parent tables to the result
        while (parent && parent !== tableName && !result.includes(parent)) {
            result.push(parent);
            tableName = parent;
            tableHierarchy = new GlideTableHierarchy(tableName);
            parent = tableHierarchy.getBase();
        }
    },

    type: 'ListMRADatabaseUtils'
};
