var OneExtendDatasetTableProcessor = Class.create();
OneExtendDatasetTableProcessor.prototype = {
    initialize: function() {},

    getSupportedTables: function() {
        // list of supported tables for which this implementation should execute
        return [];
    },

    getGlideRecord: function(tableName, encodedQuery, maxRowLimit) {
        // should return a glide record iterable
    },

    getDocument: function(tableName, sysId) {
        // should return a glide record that will act like a source for the dataset test record
    },

    getParsedValue: function(tableName, sysId, expression) {
        // return a parsed value
    },

    getScriptInputs: function(tableName, sysId) {
        // return the script inputs that will be available in the "inputs" variable during pill mapping
    },

    type: 'OneExtendDatasetTableProcessor'
};
