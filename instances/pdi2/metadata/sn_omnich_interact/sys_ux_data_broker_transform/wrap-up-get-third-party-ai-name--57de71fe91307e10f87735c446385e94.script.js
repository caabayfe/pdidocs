function transform(input) {
	var info = {};
	var interactionGr = new GlideRecord('interaction');
	var thirdPartyAIName = "";
	if (interactionGr.get(input.interactionId) && interactionGr.canRead()) {
		var providerApplicationId = interactionGr.getValue('provider_application');
		if (interactionGr.active && providerApplicationId) {
			thirdPartyAIName = sn_cs.VASystemObject.getCustomAdapterPropertyWithHierarchy('third_party_ai_source', providerApplicationId);			
		}
	}
	info.thirdPartyAIName = thirdPartyAIName;
	return info;
}
