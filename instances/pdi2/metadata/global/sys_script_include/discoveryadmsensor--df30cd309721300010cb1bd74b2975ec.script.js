var DiscoveryADMSensor = Class.create();

DiscoveryADMSensor.prototype = Object.extendsObject(DiscoveryMultiSensor, {

    /**
     * Invoked (via DiscoverySensor) once all results have been processed.  At this point there will be
     * two arrays of results: one for running processes, and the other for connections.
     * 
     * this.running_processes contains an array of maps, each with the following properties:
     *   pid:        the PID of the process
     *   ppid:       the PPID of the process
     *   name:       the name of the command (sans path)
     *   command:    the complete command (with path), but without the command's parameters
     *   parameters: the command's parameters (if any)
     * 
     * this.connections contains an array of maps, each with the following properties:   
     *   pid:        process ID of the process that owns this connection
     *   type:       "on" or "to" for listening on or connecting to, respectively
     *   ip:         the IP (v4) address we're listening on or connecting to (depending on type)
     *   port:       the port we're listening on or connecting to (depending on type)
     *   local_ip:   the local IP address we're connecting from (undefined if listening on)
     *   local_port: the local port we're connecting from (undefined if listening on)

     */
    finish: function() {
        // massage our raw connections data a bit...
        this.connections = new CookConnections('' + this.getCmdbCi()).process(this.connections);
		
        // enrich the connections and running processes...
        var epac = new EnrichProcessesAndConnections(this);
        epac.process();
		
		this.adm = new ApplicationDependencyMapping(this);
		// filter the running processes for only things that we classify...
		if (gs.getProperty('glide.discovery.active_processes_filter', 'false') == 'true' &&
			gs.getProperty('glide.discovery.auto_adm', 'false') != 'true')
        	this.running_processes = this.adm.matched_processes;
		
		epac.reconcile();

        // deduplicate connections before reconciling...
        epac.dedupeConnections();
        this.addToRelatedList('cmdb_tcp', this.connections, 'computer', 'type,ip,port');
    },
    
    /**
     * Invoked (via DiscoverySensor) once all results have been processed, the finish() method above
     * has run, and all data has been saved to the database.
     */
    after: function() {
        this.adm.process();
		var gr = this.getCmdbRecord(); 
		if (JSUtil.notNil(gr) && gr.sys_class_name == "cmdb_ci_win_server") // Currently only invoke cluster helper if it's a windows cluster
			new DiscoveryClusteredProcessHelper().process(gr);
    },
    
    type: "DiscoveryADMSensor"
});
