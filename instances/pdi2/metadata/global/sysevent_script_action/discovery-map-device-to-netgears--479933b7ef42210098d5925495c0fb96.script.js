(function() {
	var ciid = current.cmdb_ci + '';
	if (!ciid)
		return;

	var cigr = new GlideRecord("cmdb_ci");
	if (!ciid || !cigr.get('sys_id', ciid))
		return;
	
	var gru = GlideScriptRecordUtil.get(cigr);
	cigr = gru.getRealRecord();		

	// Check to see if it's a class we care about
	if (!shouldBeDone(cigr))	
		return;
	
	var DL3M = new DeviceL3Mapping(cigr);
	DL3M.map();
	
	function shouldBeDone(cigr) {	
		if (gs.getProperty('glide.discovery.L3_mapping', 'false') == 'false')
			return false;

		var dbom = GlideDBObjectManager.get();
		var tables = dbom.getHierarchy(cigr.sys_class_name);

		var classes = ["cmdb_ci_server", "cmdb_ci_netgear"];
		var weedClasses = ["cmdb_ci_ip_router", "cmdb_ci_ip_switch"];

		for (var i=0; i<weedClasses.length; i++)
			if (tables.contains(weedClasses[i]))
				return false;		
		
		for (var i=0; i<classes.length; i++)
			if (tables.contains(classes[i]))
				return true;

		return false;
	}
	
}());
