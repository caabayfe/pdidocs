function transform(input) {
	var category = input.category;
	var excludeMarketingCopy = input.excludeMarketingCopy;
	
	var util = new sn_cmdb_ws.CMDBWsProductAdoptionUtil();
	return util.getProductAdoptionStates(category, excludeMarketingCopy);
}
