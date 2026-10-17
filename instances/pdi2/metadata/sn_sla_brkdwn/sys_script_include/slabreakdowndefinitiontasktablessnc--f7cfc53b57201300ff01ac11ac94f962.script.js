var SLABreakdownDefinitionTaskTablesSNC = Class.create();
SLABreakdownDefinitionTaskTablesSNC.prototype = {
    initialize: function() {
    },

	process: function() {
		return new global.SLABreakdownUtils().getAuditedTaskTables();
	},

    type: 'SLABreakdownDefinitionTaskTablesSNC'
};
