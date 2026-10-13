var TriggerRule = Class.create();

TriggerRule.prototype = Object.extendsObject(TriggerRuleSNC, {
    
	initialize: function() {
		TriggerRuleSNC.prototype.initialize.call(this);
	},

    type: 'TriggerRule'
});
