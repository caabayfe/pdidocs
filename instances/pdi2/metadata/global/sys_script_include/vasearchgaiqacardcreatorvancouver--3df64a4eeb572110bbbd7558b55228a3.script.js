var VASearchGAIQACardCreatorVancouver = Class.create();
VASearchGAIQACardCreatorVancouver.prototype = Object.extendsObject(global.VASearchCardCreatorVancouver, {

	initialize: function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardType, dynamicChoiceNodeName) {
		global.VASearchCardCreatorVancouver.prototype.initialize.call(
			this, reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, cardType, index, dynamicChoiceNodeName);
	},

	preProcess: function() {
		this.setData('linkHref', this.getMetricsURL());
	},

	getTranslations: function() {
		if (this.CARD_DATA["identifier"] == "Top Result:") {
			var topResultTranslatedTerm = gs.getMessageLang("Top Result:", this.vaContext.getRequesterLang());
			this.setData('identifier', topResultTranslatedTerm);
		}
		if (this.CARD_DATA["headerPrefix"] == "Powered by ") {
			var poweredByTranslatedTerm = gs.getMessageLang("Powered by ", this.vaContext.getRequesterLang());
			this.setData('headerPrefix', poweredByTranslatedTerm);
		}
		if (this.CARD_DATA["footerPrefix"] == "Source: ") {
			var sourceTranslatedTerm = gs.getMessageLang("Source: ", this.vaContext.getRequesterLang());
			this.setData('footerPrefix', sourceTranslatedTerm);
		}
		if (this.CARD_DATA["tooltip"] == "Now Assist generated this answer using your knowledge base. You may want to review the sources to check for accuracy.") {
			var toolTipTranslatedTerm = gs.getMessageLang("Now Assist generated this answer using your knowledge base. You may want to review the sources to check for accuracy.", this.vaContext.getRequesterLang());
			this.setData('tooltip', toolTipTranslatedTerm);
		}
	},

	type: 'VASearchGAIQACardCreatorVancouver'
});
