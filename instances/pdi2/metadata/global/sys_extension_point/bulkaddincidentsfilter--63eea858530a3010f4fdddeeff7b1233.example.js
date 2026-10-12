var BulkAddIncidentsFilter = Class.create();
BulkAddIncidentsFilter.prototype = {
    initialize: function() {},

	getFixedQuery: function(parentTable, parentColumn) {
        /* intentionally left blank */
    },

    canRelateIncidents: function(parentTable, relatedRecordGr, parentColumn) {
        /* intentionally left blank */
    },

    type: 'BulkAddIncidentsFilter'
};
