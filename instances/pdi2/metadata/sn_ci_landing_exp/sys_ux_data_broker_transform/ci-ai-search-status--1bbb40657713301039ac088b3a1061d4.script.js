function transform() {

	var aisService = checkAISService();
	var aisInitialized = new sn_ais.StatusApi().isAisInitialized();
	var aisEnabled = new sn_ais.StatusApi().isAisEnabled();
	
	function checkAISService() {
		var grS = new GlideAggregate('sys_service');
		grS.addQuery('name', 'AISearch');
		if(grS.getCount() > 0)
			return true;
		return false;
	}
	
	var res = {};
	
	res["aisService"] = aisService;
	res["aisInitialized"] = aisInitialized;
	res["aisEnabled"] = aisEnabled;
	
	return res;

}
