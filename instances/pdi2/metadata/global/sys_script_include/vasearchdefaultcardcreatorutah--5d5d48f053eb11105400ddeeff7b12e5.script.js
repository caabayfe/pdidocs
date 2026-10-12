var VASearchDefaultCardCreatorUtah = Class.create();
VASearchDefaultCardCreatorUtah.prototype = Object.extendsObject(global.VASearchCardCreatorUtah, {
	
	initialize: function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardType, dynamicChoiceNodeName) {
		VASearchCardCreatorUtah.prototype.initialize.call(
			this, reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, cardType, index, dynamicChoiceNodeName);
	},

	preProcess: function() {
		this.setData('linkHref', this.getMetricsURL());
	},

    type: 'VASearchDefaultCardCreatorUtah'
});
