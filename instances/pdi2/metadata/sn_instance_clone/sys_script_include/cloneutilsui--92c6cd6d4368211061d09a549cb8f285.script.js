var CloneUtilsUI = Class.create();
CloneUtilsUI.prototype = {
    initialize: function() {},

    getRowCountByTableName: function(tableName,encodedQuery) {
        return this.getRowCount(tableName,encodedQuery);
    },
    getRowCount: function(tableName, encodedQuery) {
        if (!tableName) {
            return 0;
        }
        var aggregateGr = new GlideAggregate(tableName);
        if (encodedQuery) {
            aggregateGr.addEncodedQuery(encodedQuery, true);
        }
        aggregateGr.addAggregate('COUNT');
        aggregateGr.query();

        var count = aggregateGr.next() ? aggregateGr.getAggregate('COUNT') : 0;
        return count;
    },
    type: 'CloneUtilsUI'
};
