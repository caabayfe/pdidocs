var VAGeniusDefaultCardCreatorTokyo = Class.create();
VAGeniusDefaultCardCreatorTokyo.prototype = Object.extendsObject(global.VAGeniusCardCreatorTokyo, {
	
	initialize: function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index, cardType, dynamicChoiceNodeName) {
		VAGeniusCardCreatorTokyo.prototype.initialize.call(
			this, searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, cardType, index, dynamicChoiceNodeName);
	},

	preProcess: function() {
		this.setData('linkHref', this.getMetricsURL());
	},

    type: 'VAGeniusDefaultCardCreatorTokyo'
});
