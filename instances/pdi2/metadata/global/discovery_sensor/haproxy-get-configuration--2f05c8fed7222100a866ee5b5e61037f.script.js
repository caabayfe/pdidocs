new DiscoveryJSONSensor({
    
	processJSON: function() {
		var blocks = {}; 
		blocks.frontendList = related_data.frontendList; // Frontend blocks information
		blocks.backendList = related_data.backendList;   // Backend blocks information
		blocks.listenList = related_data.listenList;     // listen blocks information 
		blocks.hostList = related_data.hostList;		 // hosts information
		var lbGr = this.getCmdbRecord();  	     // A refrence to the corresponding HAProxy record in cmdb_ci_lb_appl table
		var serverIP = g_device.getSource();       // IP address of the server
		var serverName = this._getServerName();
		var haproxy = new HAProxy (blocks, lbGr, serverIP, serverName);
		haproxy.populateInfo();
    },

	// Get the name of server this app is running on from device history
	_getServerName: function() {
		var serverGr = new GlideRecord("cmdb_ci");
		serverGr.get(g_device.getSourceCmdbCi());
		return serverGr.getValue("name");
	},

    type: "DiscoveryJSONSensor"
});
