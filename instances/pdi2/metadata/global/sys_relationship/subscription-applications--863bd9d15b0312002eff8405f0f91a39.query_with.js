(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var licHasAppGR = new GlideRecord('license_has_app');
	licHasAppGR.addQuery('license', parent.sys_id);
	licHasAppGR.query();
	var apps = [];
	while (licHasAppGR.next()) {
		apps.push(licHasAppGR.getValue('app'));
	}
	
	var licensableAppGR = new GlideRecord('licensable_app');
	licensableAppGR.addQuery('sys_id', apps);
	licensableAppGR.query();
	
	var familyIds = [];
	var lineageIds = [];
	var lineageId = "";
	
	while (licensableAppGR.next()) {
		
		var famRefId = licensableAppGR.getValue("app_family_id");
		
		var famGR = new GlideRecord ("ua_app_family");
		famGR.addQuery("sys_id", famRefId);
		famGR.addQuery("primary", "1");
		famGR.addQuery("cust_visible", "1");
		famGR.query();
		
		if (famGR.next()) {
			lineageId = famGR.getValue("lineage_id");
			
			if (JSUtil.notNil(lineageId) && lineageIds.indexOf(lineageId) == -1) {
				lineageIds.push(lineageId);
				familyIds.push(famRefId);
			}
		}		
	}
	
	current.addQuery('sys_id', 'IN', familyIds);
	current.orderBy('lineage_name');

})(current, parent);
