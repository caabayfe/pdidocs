var VASearchCardCreatorFactoryUtah = Class.create();

VASearchCardCreatorFactoryUtah.getCreator = function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, dynamicChoiceNodeName) {
	var cardName = searchResults.propValues.cardName.toString();

	switch (cardName) {
		case 'PersonCard':
			return new global.VASearchUserCardCreatorUtah(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
		case 'GAIQACard':
			return new global.VASearchGAIQACardCreatorUtah(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
		case 'QACard':
			return new global.VASearchQACardCreatorUtah(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
		case 'CatalogCard':
			return new global.VASearchCatalogCardCreatorUtah(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
		default:
			return new global.VASearchDefaultCardCreatorUtah(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
	}
};
