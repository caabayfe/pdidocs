var SLABreakdownDefinitionTaskTables = Class.create();
SLABreakdownDefinitionTaskTables.prototype = Object.extendsObject(SLABreakdownDefinitionTaskTablesSNC, {
    initialize: function() {
		SLABreakdownDefinitionTaskTablesSNC.prototype.initialize.call(this);
    },

	type: 'SLABreakdownDefinitionTaskTables'
});
