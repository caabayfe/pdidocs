// Discovery & Runbook

var PuppetSensor = {
	
    getMasterCi: function() {
		
		//from Discovery
		if (typeof g_sensor != 'undefined') {
			var masterCi = g_sensor.getCmdbRecord();
			
			return masterCi ? '' + masterCi.sys_id : g_sensor.getParameter('cmdb_ci');
		} else
			return current.sys_id;
	},
	
	processPuppetMaster: function(puppetProperties) {
        var properties = {
			version: 'version',
            confdir: 'config_directory',
            manifestdir: 'manifestdir',
            modulepath: 'modulepath',
			fqdn: 'fqdn',
			ip_address: 'ip_address'
        };
		
        for (var key in properties)
			if (puppetProperties[key])
				current[properties[key]] = puppetProperties[key];
    },
    
    processModules: function(puppetModules) {
		var master_sys_id = this.getMasterCi();
		
		while (puppetModules.length > 0) {
			var module = puppetModules.shift();
			createOrUpdateModule(this, module.name, module.path);
		}
        
        function createOrUpdateModule(that, moduleName, modulePath) {           
            var properties = {
                name: moduleName,
                management_server: master_sys_id
            };
			
            var moduleGr = that.ensureExists('puppet_module', properties);
            moduleGr.path = modulePath;
            moduleGr.update();

        }
        
    },
    
    processManifests: function(manifests) {
		var master_sys_id = this.getMasterCi();
		
        var modulePathMap = (function() {
            var result = {};
            var moduleGr = new GlideRecord('puppet_module');
            moduleGr.addQuery('management_server', master_sys_id);
            moduleGr.query();
            
			while (moduleGr.next())
                result[moduleGr.path] = moduleGr.sys_id + '';
            return result;
        })();

		while (manifests.length > 0) {
			var manifest = manifests.shift();
			createOrUpdateManifest(this, manifest);	
		}
        
        function createOrUpdateManifest(that, manifest) {
            var properties = {
                name: manifest.basename,
                path: manifest.path,
                management_server: master_sys_id
            };
            
			var manifestGr = that.ensureExists('puppet_manifest', properties);
            manifestGr.content = manifest.content;
            manifestGr.module = findModule(manifest.path);
            manifestGr.update();
            
			var classes = manifest.classes;
			while (classes.length > 0)
				createOrUpdateClass(that, manifestGr, classes.shift());
            
            function findModule(path) {
                for (var modulePath in modulePathMap)
                    if (path.indexOf(modulePath) == 0)
                    return modulePathMap[modulePath];
                
                return '';
            }
        }
        
        function createOrUpdateClass(that, manifestGr, aclass) {
            var properties = {
                name: aclass.name,
                management_server: manifestGr.management_server
            };
            
			var classGr = that.ensureExists('puppet_class', properties);
            classGr.manifest = manifestGr.sys_id;
            classGr.module = manifestGr.module;
			classGr.selectable = manifestGr.name == 'init.pp';
            
			if (!gs.nil(aclass.inherits)) {
                properties.name = aclass.inherits;
                var inheritsFromClassGr = that.ensureExists('puppet_class', properties)
                classGr.inherits = inheritsFromClassGr.sys_id;
            }
            classGr.update();
			
			var parameters = aclass.params;
			var puppetParameters = [];
			for (var p = 0; p < parameters.length; p++) {
				var parm = parameters[p];
				var parameter = {
					name: parm.name,
					puppet_class: classGr.sys_id,
					management_server: classGr.management_server
				};
				
				if (parameter.defaultValue !== undefined)
                	parameter['default_value'] = parameter.defaultValue;
				
				puppetParameters.push(parameter);
			}
			
			while (parameters.length > 0) {
				var parameter = parameters.shift();
				createOrUpdateParameter(that, classGr, parameter.name, parameter.defaultValue);
			}
        }
        
        function createOrUpdateParameter(that, classGr, paramName, defaultValue) {
            var properties = {
                name: paramName,
                puppet_class: classGr.sys_id,
                management_server: classGr.management_server
            };
            
			var paramGr = that.ensureExists('puppet_parameter', properties);
            if (defaultValue !== undefined)
                paramGr.default_value = defaultValue;
            
            paramGr.update();
        }
    },
	
	processCertificateRequests: function(requests) {
		var certs = [];
		var gr = new GlideRecord('puppet_certificate_request');
		gr.addQuery('management_server', this.getMasterCi());
		gr.query();
		
		// Store all the current certs - remove those that we still see, so what's left has been accepted or removed, and we can
		// clear out the request
		while (gr.next())
			certs.push('' + gr.sys_id);
		
		while (requests.length > 0) {
			var request = requests.shift();

			gr.initialize();
			gr.addQuery('management_server', this.getMasterCi());
			gr.addQuery('node_request', request.cert_line);
			gr.query();
			
			// If it is already in the table, take it out of the current array so we don't delete it from the table
			if (gr.next()) {
				certs.splice(new ArrayUtil().indexOf(certs, '' + gr.sys_id), 1);
				continue;
			}
			
			gr.name = request.hostname;
			gr.node_request = request.cert_line;
			gr.management_server = this.getMasterCi();
			gr.insert();
		}
		
		// Remove requests that may have been accepted or rejected, but are not active requests anymore
		if (certs.length > 0) {
			gr.initialize();
			gr.addQuery('sys_id', 'IN', certs.join());
			gr.deleteMultiple();
		}
	},
	
    
    ensureExists: function(table, properties) {
        var gr = new GlideRecord(table);
        for (var key in properties)
            gr.addQuery(key, properties[key]);
        gr.query();
        if (!gr.next()) {
            gr.initialize();
            for (var key in properties)
                gr.setValue(key, properties[key]);
            gr.insert();
        }
        return gr;
    }
	
}
