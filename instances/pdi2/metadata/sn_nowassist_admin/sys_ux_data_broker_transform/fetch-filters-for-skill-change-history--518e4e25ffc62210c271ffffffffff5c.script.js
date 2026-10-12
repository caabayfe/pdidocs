function transform(){
	try{
		var productFilter = NAALlmChangeHistoryUtil.getProductListForFilter();
		var providerFilter = NAALlmChangeHistoryUtil._getProviderItems();
		var regulated_customer = NAAConstant.PLUGIN_UTIL.isRegulatedOrSelfHostedInstance() && NAASkillConfigValidator.isExternalProviderFilteringDisabled();
		var fallBackNotVisible = regulated_customer;
		return {
			productFilter : productFilter,
			providerFilter: providerFilter,
			fallBackNotVisible: fallBackNotVisible
		};
	}
	catch(error){
		gs.error("Failed to fetch products - " + error.toString());
		return [];
	}
}
