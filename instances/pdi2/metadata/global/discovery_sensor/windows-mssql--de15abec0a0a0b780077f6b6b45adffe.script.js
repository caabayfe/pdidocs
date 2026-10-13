new DiscoverySensor({
    process: function(result) {
        this.dataArray = [];
		var instance = this._findInstance(result);
		if (instance === null) {
			this.handleWarning('Not enough info for matching this SQL application (' + this.getCmdbRecord().name + ').');
			return;
		}
		
		current.instance_name = instance.instanceName;
		current.service_pack = instance.servicepack;		
        current.version = instance.version;
		current.version_name = this._getVersionName(''+instance.version);
        current.tcp_port = instance.port;
		current.port_dynamic = ( instance.portDynamic == 'true' );
		current.edition = instance.edition;
		current.engine_edition = this._synchronizeEngineEdition(''+instance.engineEdition);
        this._populateDBCatalogs(instance.databases);
    },
   
	_findInstance: function (result) {
		var paramInstanceName = this.getParameter('sqlInstance'); // optional
		if (paramInstanceName)
			paramInstanceName = (''+paramInstanceName).toUpperCase();
	   
		var paramPID = ''+this.getParameter('processID'); // always provided (process classifier)
		var instanceArray = g_array_util.ensureArray(result.sqlInstance);
        for (var i = 0; i < instanceArray.length; i++) {
            var instance = instanceArray[i];
			if (instance.error) {
				DiscoveryLogger.warn(instance.error, 'Windows - MSSQL', this.getEccQueueId());
				continue;
			}

			// match by instance name, then by pid.
			if (!instance.instanceName) // instance name required
				continue;
			if (paramInstanceName) { // match by instance name if not mssql2000
			   if (paramInstanceName !== instance.instanceName.toUpperCase())
				   continue;
			   
			   return instance;
			}

			if (paramPID == instance.pid) // match by pid
				return instance;
		    else if((!instance.pid || instance.pid == '0') && instanceArray.length === 1) // no wmi access to get pid, but it's the only result, use it
				return instance;
        }
	   
		return null;
	},
					
	/**
	 * http://sqlserverbuilds.blogspot.com/
	 * @param string version The numeric version
	 */
	_getVersionName: function(version) {
		var matches = version.match(/^(\d+)\..*$/);
		if (!matches)
			return '';
   
		var major = matches[1];
		switch (major) {
			case '11':
				return '2012';
			case '10':
				return '2008';
			case '9':
				return '2005';
			case '8':
				return '2000';
		}
   
		return '';
	},
   
	/**
 	* Ensures that the specified MSSQL engine edition is an available choice for that field. If not,
	 * the engine edition is added as a choice to the system.
	 * @return string The value passed, for cascading purposes.
	 */
    _synchronizeEngineEdition: function(value) {
		if (JSUtil.nil(value))
	   	return null;
	   
        var record = new GlideRecord('sys_choice');
        record.setWorkflow(false); // no update-set
        record.addQuery('name', 'cmdb_ci_db_mssql_instance');
        record.addQuery('element', 'engine_edition');
        record.addQuery('label', value);
        record.query();
        if (record.next()) {
			if (record.inactive) {
            	record.inactive = false;
            	record.update();
			}
        } else {
            record = new GlideRecord('sys_choice');
        	record.setWorkflow(false); // no update-set
            record.setValue('name', 'cmdb_ci_db_mssql_instance');
            record.setValue('element', 'engine_edition');
            record.setValue('value', value);
            record.setValue('label', value);
            record.setValue('inactive', false);
            record.setValue('language', 'en');
            record.insert();
        }
	   
	   return value;
    },

    _populateDBCatalogs: function(databases) {
        var nodeArray = g_array_util.ensureArray(databases.database);
        for (var i = 0; i < nodeArray.length; i++) {
            var dataObj = {};
            dataObj.name = nodeArray[i]['@id'];
            this.dataArray.push(dataObj);  
        }

        this.addToRelatedList('cmdb_ci_db_mssql_catalog', this.dataArray, 'database_instance', 'name');
    },

    zeroResults: function() {
        // do nothing; it's ok to have zero results from this sensor...
    },

    type: "DiscoverySensor "
});
