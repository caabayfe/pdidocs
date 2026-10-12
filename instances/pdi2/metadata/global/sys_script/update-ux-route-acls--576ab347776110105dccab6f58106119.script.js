(function executeRule(current, previous /*null when async*/) {
	var getPageRegRecord = function (appConfigId){
		var gr = new GlideRecord("sys_ux_page_registry");
		gr.addQuery("admin_panel", appConfigId);
		gr.query();
		if (gr.next())
			return gr;
		return null;
	};
	
	var getAclType = function (){
		var grec = new GlideRecord("sys_security_type");
		grec.addQuery("name", "ux_route");
		grec.query();
		if (grec.next()){
			return grec.getValue("sys_id");
		}
		return "";
	};
	
	var getScopeName = function (sysScope){
		var scopeRecord = new GlideRecord("sys_scope");
		if (scopeRecord.get(sysScope))	
			return scopeRecord.scope;
		return "";
	};
	
	var getVendorPrefix = function (scopeName){
		var PREFIX_NOW = "now";
		var ALT_NOW_VENDOR_PREFIXES = ["sn", "snc"];
		var PREFIX_VENDOR = "x";
		var scopeNameParts = scopeName.split("_");
		if (scopeNameParts.length < 3)
			return PREFIX_NOW;
		var vendorCode = scopeNameParts[0] === PREFIX_VENDOR ? scopeNameParts[1] : PREFIX_NOW;
		vendorCode = ALT_NOW_VENDOR_PREFIXES.indexOf(vendorCode) != -1 ? PREFIX_NOW : vendorCode;
		return vendorCode === PREFIX_NOW ? PREFIX_NOW : PREFIX_VENDOR + "." + vendorCode;
	};
	
	// return if there is no valid route type or app config
	if ( !previous.app_config || !current.route_type)
		return;
	
	var pageRegRecord = getPageRegRecord(previous.app_config);
	if (!pageRegRecord)
		return;
	
	var scopeName = getScopeName(pageRegRecord.getValue("sys_scope"));
	var vendorPrefix = getVendorPrefix(scopeName);
	var basePath = pageRegRecord.getValue("path");
	if (!basePath)
		return;
	
	var dotBasePath = vendorPrefix + "." + basePath.trim('/').replace("/",".");
	var prevACL = dotBasePath + "." + previous.route_type;
	var curACL = dotBasePath + "." + current.route_type;

	var aclType = getAclType();
	// return if there is no ux_route ACL type
	if (!aclType)
		return;
	
	var aclRecord = new GlideRecord("sys_security_acl");
	aclRecord.addQuery("type", aclType);
	aclRecord.addQuery("name", prevACL);
	aclRecord.query();
	// capture current application id
	var currentApplicationId = gs.getCurrentApplicationId();
	if (aclRecord.next()){
		gs.setCurrentApplicationId(aclRecord.getValue("sys_scope"));
		aclRecord.name = curACL;
		aclRecord.update();
	}
	// reset application id to the previous one
	gs.setCurrentApplicationId(currentApplicationId);
	
})(current, previous);
