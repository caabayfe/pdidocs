flowDepenedncies();

function flowOutgoingByIp(ip) {
	// find outgoing connections
	gs.print('ffffflow by ip: ' + ip);
	var result = [];
	var gr = new GlideRecord("sa_flow_server_comm");
	gr.addQuery("ip", ip);
	gr.query();
	while (gr.next()) {
		var epgr = new GlideRecord("cmdb_ci_endpoint_tcp");
		epgr.addQuery("host", gr.dest_ip);
		epgr.addQuery("port", gr.dest_port);
		
		gs.print("found: " + gr.dest_ip +":" + gr.dest_port);
		
		// in case of multiple records make consistent order
		epgr.orderBy("sys_created_on");
		epgr.query();
		var child_id;
		if (epgr.next()) {
			child_id = epgr.sys_id;
		} else {
			epgr.host = gr.dest_ip;
			epgr.port = gr.dest_port;
			// if no endpoint exist with the right ip and port, create one
			child_id = epgr.insert();
		}
		
		gs.print("child_id: " + child_id);
		result.push({"dv_ci_id" : child_id
		});
	}
	return result;
}

function flowDepenedncies() {
	
	var ci = new GlideRecord("cmdb_ci");
	if (!ci.get(dv_ci_id)) {
		gs.print("ci_id not found: " + dv_ci_id);
		return [];
	}
	gs.print("found ci: " + ci.sys_class_name);
	
	var ip = ci.ip_address;
	// try computer case,
	// todo: add more ips if computer
	if (ip)
		return flowOutgoingByIp(ip);
	
	if (GlideDBObjectManager.get().isInstanceOf(ci.sys_class_name, "cmdb_ci_endpoint")) {
		// check endpoint case by host field
		var ep = new GlideRecord("cmdb_ci_endpoint");
		if (ep.get(dv_ci_id) && ep.host)
			return flowOutgoingByIp(ep.host);
	} else if (GlideDBObjectManager.get().isInstanceOf(ci.sys_class_name, "cmdb_ci_appl")) {
		// For applications get the computer that runs this app and return it
		var relgr = new GlideRecord("cmdb_rel_ci");
		relgr.addQuery("parent", dv_ci_id);
		relgr.addQuery("type", "60bc4e22c0a8010e01f074cbe6bd73c3"); // Runs on::Runs
		relgr.query();
		gs.print("application relations count: " + relgr.getRowCount());
		while (relgr.next()) {
			var chci = new GlideRecord("cmdb_ci");
			if (chci.get(relgr.child) && GlideDBObjectManager.get().isInstanceOf(chci.sys_class_name, "cmdb_ci_hardware") && chci.ip_address)
				return [{"dv_ci_id" : relgr.child,
				"dv_rel_type": "60bc4e22c0a8010e01f074cbe6bd73c3"
			}];
		}
	}
	gs.print("ci does not have ip_address or host fields");
	return [];
}
