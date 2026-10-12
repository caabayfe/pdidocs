var VASearchCardCreatorFactory = Class.create();

VASearchCardCreatorFactory.getCreator = function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index) {
	
	switch (geniusResults.template) {
		case 'sn-va-genius-person-card':
			return new global.VAGeniusUserCardCreator(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index);
		case 'sn-va-genius-qa-card':
			return new global.VAGeniusQACardCreator(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index);
		default:
			return new global.VAGeniusCatalogCardCreator(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index);
	}
};
