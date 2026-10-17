var RecordHierarchyFieldSelector = Class.create();
RecordHierarchyFieldSelector.prototype = {
    initialize: function() {
    },

    type: 'RecordHierarchyFieldSelector',

	process: function(tableName) {
        return SNC.RecordHierarchyAPI.get().getEligibleFields(tableName);
    }
};
