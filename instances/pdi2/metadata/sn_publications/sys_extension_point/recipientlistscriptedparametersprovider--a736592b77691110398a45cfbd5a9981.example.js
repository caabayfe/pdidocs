var RecipientListScriptedParametersProvider = Class.create();
RecipientListScriptedParametersProvider.prototype = {
    initialize: function() {
    },
	
	canResolveParameters: function(/*GlideRecord*/ emailGr) {
		return true;
	},

    resolve: function(/*GlideRecord*/ emailGr) {
        return {}; // derive parameters required for reciepient list script using reference record on email.
    },

    type: 'RecipientListScriptedParametersProvider'
};
