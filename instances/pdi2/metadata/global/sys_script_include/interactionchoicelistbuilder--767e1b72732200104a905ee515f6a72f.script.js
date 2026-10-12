var InteractionChoiceListBuilder = Class.create();
InteractionChoiceListBuilder.prototype = {
    initialize: function() {
    },

	getStateChoiceList: function() { 
		return GlideChoiceList.getChoiceList('interaction', 'state');
	},

	getTypeChoiceList: function() { 
		return GlideChoiceList.getChoiceList('interaction', 'type');
	},
	
    type: 'InteractionChoiceListBuilder'
};
