var VASearchCardCreatorFactoryTokyo = Class.create();

VASearchCardCreatorFactoryTokyo.getCreator = function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index, dynamicChoiceNodeName) {
	var cardName = geniusResults.propValues.cardName.toString();
	switch (cardName) {
		case 'PersonCard':
			return new global.VAGeniusUserCardCreatorTokyo(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
		case 'QACard':
			return new global.VAGeniusQACardCreatorTokyo(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
		case 'CatalogCard':
			return new global.VAGeniusCatalogCardCreatorTokyo(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
		default:
			return new global.VAGeniusDefaultCardCreatorTokyo(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index, cardName, dynamicChoiceNodeName);
	}
};
