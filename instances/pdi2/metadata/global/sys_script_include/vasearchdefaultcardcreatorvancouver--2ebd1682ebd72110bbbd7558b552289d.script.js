var VASearchDefaultCardCreatorVancouver = Class.create();
VASearchDefaultCardCreatorVancouver.prototype = Object.extendsObject(global.VASearchCardCreatorVancouver, {

	initialize: function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardType, dynamicChoiceNodeName) {
		global.VASearchCardCreatorVancouver.prototype.initialize.call(
			this, reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, cardType, index, dynamicChoiceNodeName);
	},

	preProcess: function() {
		this.setData('linkHref', this.getMetricsURL());
	},

	getTranslations: function() {
	},

    type: 'VASearchDefaultCardCreatorVancouver'
});
