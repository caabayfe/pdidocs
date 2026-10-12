var VASearchQACardCreatorVancouver = Class.create();
VASearchQACardCreatorVancouver.prototype = Object.extendsObject(global.VASearchCardCreatorVancouver, {

	initialize: function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardType, dynamicChoiceNodeName) {
		global.VASearchCardCreatorVancouver.prototype.initialize.call(
			this, reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, cardType, index, dynamicChoiceNodeName);
	},

	preProcess: function() {
		this.setData('linkHref', this.getMetricsURL());
	},

	getTranslations: function() {
		if (this.CARD_DATA["linkLabel"] == "Read more") {
			var linkLabelTranslatedTerm = gs.getMessageLang("Read more", this.vaContext.getRequesterLang());
			this.setData('linkLabel', linkLabelTranslatedTerm);
		}
	},

	type: 'VASearchQACardCreatorVancouver'
});
