var InteractionScope = Class.create();
InteractionScope.prototype = {
    initialize: function() {
    },
	
	/* return true if this extension point is to be run */
	applies: function(interactionGr) {
	},

	/* return scope to be applied to interaction */
	getScopeForInteraction: function(interactionGr) {
	},

    type: 'InteractionScope'
};
