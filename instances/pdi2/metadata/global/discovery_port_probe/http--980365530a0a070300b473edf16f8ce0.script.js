function(cidata, result, scanner, status, midServer, sensor) {

    if (scanner.service != "http")
        return;

    // our default values...
    var httpdType = "";
    var httpdVersion = "";
    
    // if we got a Server option back, process it...
    if (scanner.contents.Server) {
        // get only the stuff before the first space (if there is one), and make that our type...
        var spaceParts = /^([^ ]+)( .*)?$/.exec(scanner.contents.Server);
        if (spaceParts)
            httpdType = spaceParts[1];
        
        // now see if we have a version, after a slash...
        var versionParts = /^([^\/ ]+)(\/(.*))$/.exec(httpdType);
        if (versionParts) {
            httpdType = versionParts[1];
            httpdVersion = versionParts[3];
        }
    }
    
    // now update or insert our IP service record...
    var name = httpdType + ' ' + httpdVersion;
    var svcSysID = g_disco_functions.getService(scanner.port).sys_id;
    
    updateCIData(cidata, name, svcSysID);
    
    function updateCIData(cidata, name, svcSysID) {
	// see if other port probe might've added this already
		var rl = cidata.getRelatedListInstance('cmdb_ip_service_ci', 'ci');		
		if (rl == null) {
	        rl = new CIRelatedList('cmdb_ip_service_ci', 'ci');
	        cidata.addRelatedList(rl);
		}

        var rec = {};
        rec[ 'description' ] = name;
        rec[ 'service'     ] = svcSysID;
        rl.addRec(rec);
    }
}
