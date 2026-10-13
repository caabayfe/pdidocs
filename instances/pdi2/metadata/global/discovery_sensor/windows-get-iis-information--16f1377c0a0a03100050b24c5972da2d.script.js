new DiscoverySensor({
	
	process: function(result) {
		this.webServerGR = this.getCmdbRecord();
		if (gs.nil(this.webServerGR))
			return;
		

		// workaround bug in GlideRecord
		// this.webServerProcGR = this.webServerGR.running_process;
		this.webServerProcGR = new GlideRecord("cmdb_running_process");
		if (!this.webServerProcGR.get(this.webServerGR.running_process)) {
			this.getLogger().warn("Unable to get the running process record for the IIS Server, " + this.webServerGR.name);
			return;	
		}	
		
		// end of workaround

		
		
		this.parseResult(result);
	},
	
	parseResult: function(result) {
		var currentSites = this.processIISNodes(result);
		var previousSites = this.getPreviousSites();
		
		this.updateVersion(result);
		
		this.allPorts = [];	
		this.portDeduper = {};
		
		this.updateIIS(currentSites, previousSites);
		
		this.computerGr = g_disco_functions.getChildCI(this.getCmdbRecord(), "RunsOn::Runs");
		var connections = this.reassignConnections(this.allPorts);
		this.reassignProcessPorts(this.webServerProcGR, this.getSystemProcess(), this.allPorts);
		
		this.findRelToIIS(connections, this.webServerGR);		
	},
	
	updateIIS: function(currentSites, previousSites) {
		for (var cid in currentSites) {		
			var webSiteGR = new GlideRecord('cmdb_ci_web_site');
			
			if (previousSites[cid])
				webSiteGR.get(previousSites[cid]);
			
			webSiteGR.name = currentSites[cid].comment;
			webSiteGR.log_directory = currentSites[cid].logdir;
			webSiteGR.short_description = currentSites[cid].name;
			webSiteGR.correlation_id = cid;
			webSiteGR.web_server = this.webServerGR.sys_id;
			var servbparts = [];
			var secrbparts = [];
			var serverBindings = currentSites[cid]['server_bindings'];
			var secureBindings = currentSites[cid]['secure_bindings'];
			var ip_address = "";
			var ports = "";
			if (serverBindings)
				servbparts = serverBindings.split(",");
			
			for (var i = 0; i < servbparts.length; i++) {
				var items = servbparts[i].split("=");
				
				if (items.length != 2)
					continue;
				
				if (items[0] == "IP")
					ip_address = items[1];
				
				if (items[0] == "Port") 
					ports = (!ports ? "" : (ports + ",")) + items[1];
			}
		
			if (secureBindings)
				secrbparts = secureBindings.split("=");
			
			if (secrbparts.length == 2 && secrbparts[0] == "Port")
				ports = ports + "," + secrbparts[1].replace(/[^0-9]/g,"");
			
			webSiteGR.last_discovered = ''+new GlideDateTime().getDisplayValue(); 
			if (!webSiteGR.first_discovered)
				webSiteGR.first_discovered = webSiteGR.last_discovered;
			webSiteGR.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
			
			webSiteGR.ip_address = ip_address;
			webSiteGR.tcp_port = ports;
			
			if (previousSites[cid])
				webSiteGR.update();
			else
				webSiteGR.insert();
			
			
			g_disco_functions.createRelationship(webSiteGR, this.getCmdbRecord(), "Hosted on::Hosts");
			
			this._trackPorts(ports);			
		}						
	},
	
	/*
	*  Track all the ports owned by the IIS process
	*/
	_trackPorts: function(ports) {	
		var newPorts = ports.split(',');
		for (var i = 0; i < newPorts.length; i++) {
			var port = newPorts[i].trim();
			if (!this.portDeduper[port]) {
				this.portDeduper[port] = true;
				this.allPorts.push(port);
			}
		}		
	},
				
	/**
 	* reassignConnections:
 	* Windows has a System process with PID=4 that listens on ports for software applications such as IIS
 	* Iterate through the ports that IIS is configured to listen on and reassign to IIS any connections
 	* for the port from the System process.
 	*/		
	reassignConnections: function(ports) {
		// All the connections that are corrected...
		var connections = [];
		for (var i=0; i < ports.length; i++) {
			var port = ports[i];
			
			// The port has been has been reassigned before. Skip to the next port...
			if (this.connectionExists(this.computerGr.sys_id, port, this.webServerGR.running_process, "on")) 
				continue;
			
			var gr = new GlideRecord("cmdb_tcp");			
			gr.addQuery("computer", this.computerGr.sys_id);
			gr.addQuery("pid", 4);
			gr.addQuery("port", port);
			gr.addQuery("absent", false);
			gr.addQuery("type", "on");
			gr.query();
			while (gr.next()) {
				// Correct the TCP connection with the right process
				gr.pid = this.webServerProcGR.pid;
				gr.process = this.webServerGR.running_process;
				gr.update();
				
				var conn = {};
				conn["port"] = port;
				conn["ip_address"] = gr.ip_address;
				connections.push(conn);				
			}									
		}
		
		return connections;
	},
	
	/*
 	* check if a tcp connection exists for this computer, port, and process
 	*/
	connectionExists: function(computer, port, proc, connType) {
		var gr = new GlideRecord("cmdb_tcp");
		gr.addQuery("computer", computer);
		gr.addQuery("port", port);
		gr.addQuery("process", proc);
		gr.addQuery("absent", false);
		gr.addQuery("type", connType);
		gr.query();
		if (gr.next())
			return true;
		
		return false;
	},	
	
	getSystemProcess: function() {
		var gr = new GlideRecord("cmdb_running_process");
		gr.addQuery("computer", this.computerGr.sys_id);
		gr.addQuery("pid", 4);
		gr.addQuery("absent", false);
		gr.query();
		if (gr.next())
			return gr;
		
		return null;		
	},
	
	/*
	* Reassign the corresponding ports from the system process to the IIS process
	*/
	reassignProcessPorts: function(iisGr, systemGr, ports) {
		if (systemGr)
			this._fixupSystemProcessListeningPort(systemGr, ports);
	
		if (iisGr)
			this._fixupIISProcessListeningPort(iisGr, ports);
					
	},
	
	_fixupSystemProcessListeningPort: function(systemGr, ports) {

		var lo = systemGr.listening_on;
		if (JSUtil.nil(lo)) // There's nothing to fix
			return;
		
		for (var i=0; i<ports.length; i++) {
			var port = ports[i];
			if (lo.indexOf(port) < 0)
				continue;  // Most likely the port has been moved
			
			var parts = lo.split(":");
			var length = parts.length;
			if (length == 0)		// There's no more ports
				break;
			else if (length == 3)	// This means there's only one port assigned. e.g. :123:
				lo = lo.replace(":"+port+":", "");
			else if (length > 3)	// more than one port. e.g. :123:456:
				lo = lo.replace(port+":", "");
		}
		
		systemGr.listening_on = lo;
		systemGr.update();
	},
	
	_fixupIISProcessListeningPort: function(iisGr, ports) {
		var lo = iisGr.listening_on;
		for (var i=0; i<ports.length; i++) {
			var port = ports[i];
			if (lo.indexOf(port) > 0)
				continue;  // the Port has been added;
			
			if (JSUtil.nil(lo))
				lo = ":" + port + ":";
			else 
				lo = lo + port + ":";
		}
		iisGr.listening_on = lo;
		iisGr.update();
	},
	
	/*
	*  Look for any connections to the IIS process and if those processes have been classified, then go ahead and make the relationship
	*/
	findRelToIIS: function(iisGr, connections) {
		// if we're not supposed to do ADM, well, then DON'T do it!
		if (gs.getProperty('glide.discovery.application_mapping') != 'true')
			return;
		
		var keys = [];
		for (var i=0; i<connections.length; i++) {
			var conn = connections[i];
			keys.push("to_" + conn["ip_address"] + "_" + conn["port"]);			
		}	
		
		var processes = [];
		var gr = new GlideRecord("cmdb_tcp");		
		gr.addQuery("key", keys);
		gr.query();
		while(gr.next())
			processes.push(gr.process.sys_id);
		
		var gr = new GlideRecord("cmdb_ci_appl");		
		gr.addQuery("running_process", processes);
		gr.query();
		while(gr.next())
			g_disco_functions.createRelationshipIfNotExists(gr, iisGr, "Depends on::Used by");		
	},
	
	
	/**
 	* createRelToIIS:
 	*   after reassigning a cmdb_tcp record from the SYSTEM (PID=4) process to IIS, create any
 	*   missing ADM relationships.    Note: these relationships would get created next time ADM runs, but we
 	*   are adding them proactively.
 	*/
	createRelsToIIS: function(iis, ip, port) {
		// if we're not supposed to do ADM, well, then DON'T do it!
		if (gs.getProperty('glide.discovery.application_mapping') != 'true')
			return;
		
		// find all application records (cmdb_ci_appl) that correspond to processes connecting to
		// our IIS server IP and port.
		var gr = new GlideRecord("cmdb_ci_appl");
		var grsq = gr.addJoinQuery("cmdb_tcp", "running_process", "process");
		
		grsq.addCondition("ip", ip);
		grsq.addCondition("port", port);
		grsq.addCondition("absent", false);
		grsq.addCondition("type", "to");
		
		gr.addQuery("sys_id", "!=", iis.sys_id); // iis talks to itself apparently
		gr.addNotNullQuery("classifier");
		gr.query();
		
		// create a relationship with IIS for each
		while (gr.next()) {
			g_disco_functions.createRelationshipIfNotExists(gr, iis, "Depends on::Used by");
		}
		
	},	
	
	
	updateVersion: function(result) {
		var regKey = "HKEY_LOCAL_MACHINE.SOFTWARE.Microsoft.InetStp";
		var node = g_disco_functions.findRegistryNode(result.Registry, regKey);
		var majorVersion = g_disco_functions.findNodeValueWithAttribute(node, "MajorVersion");
		var minorVersion = g_disco_functions.findNodeValueWithAttribute(node, "MinorVersion");
		
		if (JSUtil.isNil(majorVersion))
			return;
		
		var version = JSUtil.isNil(minorVersion) ? majorVersion : majorVersion + "." + minorVersion;
		if (DiscoveryCMDBUtil.useCMDBIdentifiers())
			DiscoveryCMDBUtil.createOrUpdateApp(this.getCmdbRecord(), g_device.getSourceCmdbCi()+'', "Runs on::Runs", {'version': version});
		else
			current.version = version;
	},
	
	processIISNodes: function(result) {
		var sites = {};
		
		// try using info from root/WebAdministration namespace
		var nodes = g_array_util.ensureArray(result.Site);
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var site_name = node.Id;
			
			var pattern = /Directory=([^,]+),/;
			var matched = pattern.exec(node.LogFile);
			var logdir = matched ? matched[1] : "";
			
			pattern = /BindingInformation=([^,]*):(\d+):/g;
			var bindings = node.Bindings;
			if (JSUtil.nil(bindings))
				continue;

			bindings = bindings.match(pattern);

			var bindStr = "";
			if (bindings) {
				pattern = /BindingInformation=([^,]*):(\d+):/;
				
				// each match is an element in the array
				for (var j = 0; j < bindings.length; j++) {
					var bind = bindings[j];
					var bindinfo = pattern.exec(bind);
					
					// parse the sub string and just grab the IP and Port info
					if (bindinfo) {
						var ip = bindinfo[1];
						var port = bindinfo[2];
						
						if (ip && !ip.equals("*"))
							bindStr = bindStr + ",IP=" + ip;
						
						if (port)
							bindStr = bindStr + ",Port=" + port;
						
					}
				}
				//remove leading ,
				bindStr = bindStr.substr(1);
			}
			
			var site_id = site_name + "@" + this.getCmdbCi();
			sites[site_id] = {};
			sites[site_id]['name'] = site_name;
			sites[site_id]['comment'] = node.Name;
			sites[site_id]['logdir'] = logdir;
			sites[site_id]['server_bindings'] = bindStr;
			sites[site_id]['secure_bindings'] = "";
		}
		
		if (!JSUtil.isEmpty(sites))
			return sites;
		
		// otherwise, use the old root/MicrosoftIISv2 namespace
		var nodes = g_array_util.ensureArray(result.IIsWebServerSetting);
		
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var site_name = (node.Name).split('/')[1];
			var comment = node.ServerComment;
			var logdir = node.LogFileDirectory;
			var serverBindings = node.ServerBindings;
			var secureBindings = node.SecureBindings;
			
			var site_id = site_name + "@" + this.getCmdbCi();
			
			sites[site_id] = {};
			sites[site_id]['name'] = site_name;
			sites[site_id]['comment'] = comment;
			sites[site_id]['logdir'] = logdir;
			sites[site_id]['server_bindings'] = serverBindings;
			sites[site_id]['secure_bindings'] = secureBindings;
		}
		
		return sites;
	},
	
	getPreviousSites: function() {
		var sites = {};
		
		var webSiteGR = new GlideRecord('cmdb_ci_web_site');
		webSiteGR.addQuery('web_server',this.webServerGR.sys_id);
		webSiteGR.query();
		
		while (webSiteGR.next()) {
			var cid = webSiteGR.correlation_id;
			sites[cid] = new String(webSiteGR.sys_id);
		}
		
		return sites;
	},
	
	type: "DiscoverySensor"
});
