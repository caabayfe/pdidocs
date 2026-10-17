var VASearchCardCreatorFactoryYokohama = Class.create();

VASearchCardCreatorFactoryYokohama.getCreator = function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, dynamicChoiceNodeName) {
	var cardName = searchResults.propValues.cardName.toString();

	switch (cardName) {
		case 'CatalogCard':
			return new global.VASearchCatalogCardCreatorYokohama(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		default:
			return global.VASearchCardCreatorFactoryXanadu.getCreator(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, dynamicChoiceNodeName);
	}
};
