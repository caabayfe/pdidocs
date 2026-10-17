new DiscoveryJSONSensor({

    processJSON: function() {

		if (JSUtil.notNil(related_data.info)) {
			DiscoveryLogger.info(related_data.info, this.getSensorName(), this.getEccQueueId());
			return;
		}

		if (JSUtil.nil(related_data.servers)) {
            this.warn("Could not find or correctly parse the config.xml file for this weblogic instance");
			return;
		}
        this.servers = related_data.servers;
		this.hostName = g_sensor.getCmdbRecord().getValue('name');
		if (this.hostName.indexOf('@') > -1)
			this.hostName = this.hostName.split('@')[1];

		if (JSUtil.nil(related_data.apps)) {
            this.warn("No related web applications were found for this weblogic instance");
            return;
        }
        this.apps = related_data.apps;

        this.writeServers(this.servers);
        this.writeApps(this.apps);
    },

    writeServers: function(servers) {
		
        for (var i = 0; i < servers.length; i++) {
            var appServer = new GlideRecord('cmdb_ci_app_server_weblogic');
            appServer.addQuery("name", servers[i] + '@' + this.hostName);
			appServer.addQuery("weblogic_domain", current.weblogic_domain);
            appServer.query();
            if (appServer.next()) {
                // Most likely this application is not run from the AdminServer (current = AdminServer) since
                // We only parse config.xml once for each AdminServer. However, the classifier did make
                // a cmdb_ci_app_server_weblogic for each server running so lets update it with the domain
                // and version information obtained from AdminServer (it will be the same)
                appServer.weblogic_domain = current.weblogic_domain;
                appServer.version = current.version;
                appServer.update();
            }
        }

    },

    writeApps: function(apps) {	
        for (var i = 0; i < apps.length; i++) {
            var app = apps[i];
			
            // Search for this app's server via target property
            var appServer = new GlideRecord('cmdb_ci_app_server_weblogic');
            appServer.addQuery("name", app.target + '@' + this.hostName);
            appServer.query();

            if (appServer.next()) {
				
				var mutexName = appServer.sys_id + ':' + app.name;
				var mutexMetricName = 'Weblogic Application Mutex';
				var mutex = new SelfCleaningMutex(mutexName, mutexMetricName);
				// limit our attempt to get a mutex to 60 seconds...
				mutex.setSpinWait(500);
				mutex.setMaxSpins(120);
				mutex.setMutexExpires(60000); 
				if (mutex.get()) {
					try {
						var gr = new GlideRecord('cmdb_ci_web_application');
						gr.addQuery("app_server", appServer.getValue('sys_id') );
						gr.addQuery("name", app.name);
						gr.query();
						if (!gr.next()) {
							gr.initialize();
							gr.app_server = appServer.getValue('sys_id');
							gr.name = app.name;
							gr.context_path = app.path;
							gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");

							gr.insert();
							g_disco_functions.createRelationship(appServer, gr, "Contains::Contained by");
						}
					}
					finally {
						mutex.release();
					}
				} else 
					//lock failed
					DiscoveryLogger.warn("Unable to get mutex " + mutexName, 'Linux - Weblogic - Get config.xml', this.getEccQueueId(), null);
			 }
		}
               
    },

    type: "DiscoveryJSONSensor"
});
