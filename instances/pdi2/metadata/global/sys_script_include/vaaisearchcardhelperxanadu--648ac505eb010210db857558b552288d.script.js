var VAAISearchCardHelperXanadu = Class.create();

VAAISearchCardHelperXanadu.getCardName = function(aiSearchCardName, mode, deviceType, needNDSCard) {

	var searchingMode = mode;

	if (!gs.nil(needNDSCard) && needNDSCard === false) // If NDS is not required, override the mode with Regular.
		searchingMode = "Regular";
	else if (!gs.nil(needNDSCard) && needNDSCard === true) // If NDS is required, override the mode with LLM.
		searchingMode = "LLM";
	
	// find the card name from DB.
	var foundCardName = getAdapterCardName(aiSearchCardName, searchingMode, deviceType);

	// if not found, try again with empty device type.
	if (gs.nil(foundCardName))
		foundCardName = getAdapterCardName(aiSearchCardName, searchingMode, "");

    // still not found, then return the same card name. 
	return gs.nil(foundCardName) ? aiSearchCardName : foundCardName;
};

function getAdapterCardName(aiSearchCardName, mode, deviceType) {

	var gr = new GlideRecord(global.AISearchConstants.AI_SEARCH_CARD_TO_ADAPTER_CARD_MAP_TABLE);
	gr.addQuery("ai_search_card_name", aiSearchCardName);
	gr.addQuery("mode", mode);
	gr.addQuery("device_type", deviceType);
	gr.query();
	
	return gr.next() ? gr.getValue("adapter_card_name") : "";
}
