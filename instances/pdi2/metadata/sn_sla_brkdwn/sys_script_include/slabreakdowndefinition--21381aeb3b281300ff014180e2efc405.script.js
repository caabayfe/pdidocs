var SLABreakdownDefinition = Class.create();
SLABreakdownDefinition.prototype = Object.extendsObject(SLABreakdownDefinitionSNC, {
    initialize: function(breakdownGr) {
		SLABreakdownDefinitionSNC.prototype.initialize.call(this, breakdownGr);
    },

    type: 'SLABreakdownDefinition'
});
