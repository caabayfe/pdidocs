var AppManagerCache = Class.create();
AppManagerCache.prototype = {
    initialize: function() {
        this.supportedCache = ["storeResponse", "pluginResponse", "appChecksums"];
        this.disableStoreCache = gs.getProperty("sn_appclient.enable_app_manager_cache", "false") != "true";
        this.reader = new AttachmentReader();
    },

    getCacheGr: function(key, sharedInternally) {
        if (this.supportedCache.indexOf(key) == -1 || this.disableStoreCache || gs.hasRole("maint"))
			// we dont want to support caching for maint users as maint user has access to special privilaged apps that can pollute the cache.
            return null;

        sharedInternally = sharedInternally ? true : false;
        var cacheGr = sn_app_api.AppStoreAPI.getAppManagerCacheGr(key, sharedInternally);

        return cacheGr;
    },

    getResponseFromCache: function(key, sharedInternally) {
        var cacheGr = this.getCacheGr(key, sharedInternally);
        if (gs.nil(cacheGr))
            return null;

        var gr = new GlideRecord('sys_attachment');
        gr.addQuery("table_sys_id", cacheGr.sys_id.toString());
        gr.query();
        if (!gr.next())
            return null;

        try {
            var content = this.reader.getContent(gr);
            return JSON.parse(content);
        } catch (e) {
            gs.error(e);
        }

        return null;
    },

    putResponseInCache: function(key, responseObj, sharedInternally) {
        var cacheGr = this.getCacheGr(key, sharedInternally);
        if (!cacheGr)
            return null;

        this.deleteCache(key, cacheGr);

        var gsa = new GlideSysAttachment();
        try {
            var attachmentId = gsa.write(cacheGr, "response.txt", 'text/plain', JSON.stringify(responseObj));
        } catch (e) {
            gs.error('putResponseInCache: ' + JSON.stringify(e));
        }
    },

    deleteCache: function(key, cacheTableGr) {
        var cacheGr = cacheTableGr ? cacheTableGr : getCacheGr(key);
        if (!cacheGr)
            return null;

        var gr = new GlideRecord("sys_attachment");
        gr.addQuery("table_sys_id", cacheGr.sys_id.toString());
        gr.setWorkflow(false);
        gr.query();
        if (gr.getRowCount() > 0)
            gr.deleteMultiple();

        return true;
    },

	deleteAppsPluginsFromCache: function(args) {
		var cacheAppResponse = this.getResponseFromCache("storeResponse", args.sharedInternally);
		var cachePluginResponse = this.getResponseFromCache("pluginResponse", false);

		if (gs.nil(args) || gs.nil((args.specificAppsToUpdate)) || args.specificAppsToUpdate.length <= 0)
			return;

		var appPluginIdMap = this._getAppPluginIdMap(args.specificAppsToUpdate);

		if(!gs.nil(cacheAppResponse) && cacheAppResponse.data.length > 0) {
			cacheAppResponse.data = cacheAppResponse.data.filter(function(cachedApp) {
				return !appPluginIdMap.hasOwnProperty(cachedApp.sys_id);
			});
			this.putResponseInCache("storeResponse", cacheAppResponse, args.sharedInternally);
		}

		if(!gs.nil(cachePluginResponse) && cachePluginResponse.length > 0) {
			cachePluginResponse = cachePluginResponse.filter(function(cachedPlugin) {
				return !appPluginIdMap.hasOwnProperty(cachedPlugin.sys_id);
			});
			this.putResponseInCache("pluginResponse", cachePluginResponse, false);
		}

	},
	
	deleteAppsFromCache: function(args) {
		var cacheAppResponse = this.getResponseFromCache("storeResponse", args.sharedInternally);
		
		if (gs.nil(args) || gs.nil((args.specificAppsToUpdate)) || args.specificAppsToUpdate.length <= 0)
			return;
		
		var appIdMap = this._getAppPluginIdMap(args.specificAppsToUpdate);

		if(!gs.nil(cacheAppResponse) && cacheAppResponse.data.length > 0) {
			cacheAppResponse.data = cacheAppResponse.data.filter(function(cachedApp) {
				return !appIdMap.hasOwnProperty(cachedApp.sys_id);
			});
			this.putResponseInCache("storeResponse", cacheAppResponse, args.sharedInternally);
		}

	},
	
	updateInstalledPluginsInCache: function(args) {
		var cachePluginResponse = this.getResponseFromCache("pluginResponse", false);
		if (gs.nil(args) || gs.nil((args.specificAppsToUpdate)) || args.specificAppsToUpdate.length <= 0)
			return;
		
		var pluginIdMap = this._getAppPluginIdMap(args.specificAppsToUpdate);
		
		if(!gs.nil(cachePluginResponse) && cachePluginResponse.length > 0) {			
			cachePluginResponse.forEach(function(cachedPlugin) {
				if(pluginIdMap.hasOwnProperty(cachedPlugin.sys_id)) {
					cachedPlugin.active = "1";
					cachedPlugin.isInstalled = true;
					gs.info("cachedPlugin.sys_id: " + cachedPlugin.sys_id);
				}
			});
			this.putResponseInCache("pluginResponse", cachePluginResponse, false);
		}
	},
	
	appendInstalledAppsToCache: function(args) {
		var cacheAppResponse = this.getResponseFromCache("storeResponse", args.sharedInternally);
		if (gs.nil(args) || gs.nil((args.appsList)) || args.appsList.length <= 0)
			return;
		
		if(!gs.nil(cacheAppResponse) && cacheAppResponse.data.length > 0) {
			cacheAppResponse.data = cacheAppResponse.data.concat(args.appsList);
			this.putResponseInCache("storeResponse", cacheAppResponse, args.sharedInternally);
		}
	},
	
	removeAndAppendCorrectAppsInCache: function(args) {
		var cacheAppResponse = this.getResponseFromCache("storeResponse", args.sharedInternally);

		if (gs.nil(args) || gs.nil((args.specificAppsToUpdate)) || args.specificAppsToUpdate.length <= 0)
			return;

		var appIdMap = this._getAppPluginIdMap(args.specificAppsToUpdate);

		if(!gs.nil(cacheAppResponse) && cacheAppResponse.data.length > 0) {
			// delete apps from cache
			cacheAppResponse.data = cacheAppResponse.data.filter(function(cachedApp) {
				return !appIdMap.hasOwnProperty(cachedApp.sys_id);
			});

			//append apps to cache
			if (!gs.nil(args) && !gs.nil((args.appsList)) && args.appsList.length > 0) {
				cacheAppResponse.data = cacheAppResponse.data.concat(args.appsList);
			}

			this.putResponseInCache("storeResponse", cacheAppResponse, args.sharedInternally);
		}

	},

	deleteAllCache: function() {
		var gr = new GlideRecord("sn_appclient_app_manager_cache");
		gr.addQuery("key", "IN", this.supportedCache);
		gr.query();

		while (gr.next()) {
			this.deleteCache(gr.getValue("key"), gr, gr.getValue("shared_internally"));
		}
	},

	_getAppPluginIdMap: function(appsPluginsList) {
		var appPluginIdMap = {};
		appsPluginsList.forEach(function(app){
			appPluginIdMap[app.sourceAppId] = true;
			if(!gs.nil(app.sysCode))
				appPluginIdMap[app.sysCode] = true;
		});
		return appPluginIdMap;
	},

	getAttachmentGr: function(cacheGr) {
		var attachmentGr = new GlideRecord("sys_attachment");
		attachmentGr.addQuery("table_sys_id", cacheGr.getUniqueValue());
		attachmentGr.query();
		return attachmentGr;
	},

	getCacheLastUpdatedTime: function(args) {
		var cacheLastUpdatedTime = new GlideDateTime();
		if(gs.nil(args) || !args.hasOwnProperty("key") || !args.hasOwnProperty("sharedInternally"))
			return cacheLastUpdatedTime;

		var cacheGr = this.getCacheGr(args.key, args.sharedInternally);
		if (!gs.nil(cacheGr) && cacheGr.isValidRecord()) {
			var attachmentGr = this.getAttachmentGr(cacheGr);
			if(attachmentGr.next()) {
				cacheLastUpdatedTime = attachmentGr.sys_updated_on;
			}
		}
		return cacheLastUpdatedTime;
	},

    type: 'AppManagerCache'
};
