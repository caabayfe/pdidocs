var RecordHierarchyTableSelector = Class.create();
RecordHierarchyTableSelector.prototype = {
    initialize: function() {},

    type: 'RecordHierarchyTableSelector',

    process: function() {
		return SNC.RecordHierarchyAPI.get().getEligibleTables();
	}
	
};
