populateParms();

function populateParms() {
	if (!gs.getUser().hasRole("clone_admin")) {
		response.error_string = "Invalid admin user";
		return;
	}
	
	if ('false' == gs.getProperty("glide.db.clone.allow_clone_target", 'true')) {
		response.error_string = "Destination does not allow clone requests (Typically used by live production instances, a property was set that prevents the instance from being cloned over).";
		return;
	}
	
	response.instance_id = gs.getProperty("instance_id");
	response.production = GlideUtil.isProductionInstance();
	response.war_version = gs.getProperty("glide.war");
	
	var requestExcludeJdbc = !gs.nil(request.exclude_jdbc_params) && request.exclude_jdbc_params == 'true';
	var globalExcludeJdbc = gs.getProperty("glide.db.clone.ha_get_params_ws.exclude_jdbc_params", 'false') == 'true';
	var includeJdbcParams = !requestExcludeJdbc && !globalExcludeJdbc;
	
	if (includeJdbcParams) {
		var parms = GlideDBUtil.getPrimaryDBConfigurationParms();
		response.name = parms.getDatabaseName();
		response.user = parms.getUser();
		response.rdbms = parms.getRDBMS();
	
		// for ease of development and testing in dev environments just use localhost (no sql permission; also IP address lookup takes 5s)
		var primaryIP = GlideUtil.isDeveloperInstance() ? "localhost" : GlideHostUtil.getPublicIPAddress();
		response.ip = primaryIP;
	
		var dbUrl = parms.getURL().replace("//localhost", "//" + primaryIP);
		response.url = dbUrl;
	
		var pwd = parms.getPassword();
		response.password = ""; // this is no longer in use by caller
	
		var ts = parms.getTableSpaceName();
		if (ts == null)
			ts = "";
	
		response.tablespace = ts;
	}
	
	var tokenGR = new GlideRecord("clone_token");
	if (!tokenGR.isValid())
		return;
	
	tokenGR.initialize();
	tokenGR.clone_id = request.clone_id;
	var tokenId = GlideSecureRandomUtil.getSecureRandomString(40);
	tokenGR.security_token = tokenId;
	tokenGR.insert();
	
	response.security_token = tokenId || "";
}
