var VASearchCardCreatorFactoryVancouver = Class.create();

VASearchCardCreatorFactoryVancouver.getCreator = function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, dynamicChoiceNodeName) {
	var cardName = searchResults.propValues.cardName.toString();

	switch (cardName) {
		case 'PersonCard':
			return new global.VASearchUserCardCreatorVancouver(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		case 'GAIQACard':
			return new global.VASearchGAIQACardCreatorVancouver(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		case 'QACard':
			return new global.VASearchQACardCreatorVancouver(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		case 'CatalogCard':
			return new global.VASearchCatalogCardCreatorVancouver(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		default:
			return new global.VASearchDefaultCardCreatorVancouver(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
	}
};
