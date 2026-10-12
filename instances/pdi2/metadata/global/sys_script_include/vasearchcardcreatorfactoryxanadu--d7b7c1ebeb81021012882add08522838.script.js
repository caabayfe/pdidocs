var VASearchCardCreatorFactoryXanadu = Class.create();

VASearchCardCreatorFactoryXanadu.getCreator = function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, dynamicChoiceNodeName) {
	var cardName = searchResults.propValues.cardName.toString();

	switch (cardName) {
		case 'PersonCard':
			return new global.VASearchUserCardCreatorVancouver(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		case 'GAIQACard':
			return new sn_nowassist_va.NowAssistSearchGAIQACardCreator(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		case 'QACard':
			return new global.VASearchQACardCreatorVancouver(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		case 'CatalogCard':
			return new global.VASearchCatalogCardCreatorXanadu(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
		default:
			return new global.VASearchDefaultCardCreatorVancouver(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardName, dynamicChoiceNodeName);
	}
};
