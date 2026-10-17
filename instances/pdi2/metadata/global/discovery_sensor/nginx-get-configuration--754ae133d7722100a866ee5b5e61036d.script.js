new DiscoveryJSONSensor({
    
	processJSON: function () {
		/**
		 * Collected information related upstream blocks, server blocks and host information is passed
		 * to an object of nginx to populate information
		 */
		var blocks = {}; 
		blocks.serverList = related_data.serverList;		
		blocks.upstreamList = related_data.upstreamList;	
		blocks.hostList = related_data.hostList; 
		var serverIP = g_device.getSource();       	 // IP address of the server 
		var webServerGr = this.getCmdbRecord(); 		// The reference to the record in cmdb_ci_linux_server
		
		var nginx = new Nginx (blocks, serverIP, webServerGr); 
		// populate lb information if only nginix is working as a load balancer
		// It is possible that the nginx is running only as a web-server on the machine.
		if (nginx.isLoadBalancer())
			nginx.populateInfo();
    },

    type: "DiscoveryJSONSensor"
});
