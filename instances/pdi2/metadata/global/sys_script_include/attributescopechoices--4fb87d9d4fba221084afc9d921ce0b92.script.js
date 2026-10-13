var AttributeScopeChoices = Class.create();
AttributeScopeChoices.prototype = {
    initialize: function() {},

    process: function() {
        // this function only returns tables that extend sys_metadata. Do not add non-sys_metadata tables to the list
        var tables = ['discovery_schedule', 'discovery_range_item', 'discovery_range'];

        return tables;
    },

    type: 'AttributeScopeChoices'
};
