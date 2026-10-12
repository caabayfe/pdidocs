var BUServiceTables = Class.create();
BUServiceTables.prototype = {
    initialize: function() {},

    process: function() {
        var tables = [];
        var config = new GlideRecord("service_table_config");
        config.addActiveQuery();
        config.query();
        while (config.next())
            tables.push(config.getValue("service_table"));
        return tables;
    },

    type: 'BUServiceTables'
};
