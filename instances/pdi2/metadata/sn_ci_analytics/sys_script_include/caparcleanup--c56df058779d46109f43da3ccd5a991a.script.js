var CAPARCleanUp = Class.create();
CAPARCleanUp.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger({
            source: "CAPARCleanUp",
        });
    },

    //Groups records based on a field and deletes older records in each group exceeding a specified count
    performCleanUp: function(table, field, value, maxRecords) {
        if (gs.nil(table || gs.nil(field) || gs.nil(maxRecords)))
            return;
        var ga = new GlideAggregate(table);
        if (value)
            ga.addQuery(field, '=', value);
        ga.addAggregate('COUNT');
        ga.groupBy(field);
        ga.addHaving('COUNT', '>', maxRecords);
        ga.query();
        while (ga.next()) {
            var count = ga.getAggregate('COUNT');
            var enQuery = field + '=' + ga.getValue(field);
            this.logger.debug('Table: {0}, field: {1}, value: {2}, count: {3}', [table, field, ga.getDisplayValue(field), count]);
            this._deleteOldRecords(table, enQuery, 'sys_updated_on', count - maxRecords);
        }
    },

    _deleteOldRecords: function(table, enQuery, orderByField, limit) {
        if (!table)
            return;
        var gr = new GlideRecord(table);
        if (enQuery)
            gr.addEncodedQuery(enQuery);
        if (orderByField)
            gr.orderBy(orderByField);
        if (limit)
            gr.setLimit(limit);
        gr.query();
        while (gr.next()) {
            this.logger.debug('Deleting record - table: {0}, record: {1}', [table, gr.getUniqueValue()]);
            gr.deleteRecord();
        }
    },

    type: 'CAPARCleanUp'
};
