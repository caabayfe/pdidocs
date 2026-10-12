var AppManagerHandler = Class.create();
AppManagerHandler.prototype = {
    initialize: function() {
        this.appManagerAPI = global.AppManagerAPI;
        this.useQueuedInstall = gs.getProperty("sn_appclient.use_queued_installation") == 'true';
        this.appUpgarder = new AppUpgrader();
    },

    _trackAndBuildResponse: function(inputPayload, response, id, type, mode) {
        var trackerPayload = CommonUtils.parse(response);
        var trackerId = trackerPayload && trackerPayload.links && trackerPayload.links.progress && trackerPayload.links.progress.id;
        if (trackerId)
            trackerPayload.trackerId = trackerId;
        CommonUtils.addProgressTracker(inputPayload, trackerPayload, id, type, mode);
        return trackerPayload;
    },

    _trackAndBuildBatchResponse: function(inputPayload, response, id, type, mode) {
        var trackerPayload = CommonUtils.parse(response);
        var trackerId = trackerPayload && trackerPayload.links && trackerPayload.links.progress && trackerPayload.links.progress.id;
        var batchInstallId = trackerPayload && trackerPayload.links && trackerPayload.links.results && trackerPayload.links.results.id;
        if (trackerId) {
            trackerPayload.batchInfo = {};
            trackerPayload.batchInfo[Constants.EXECUTION_TRACKER_ID] = trackerId;
            trackerPayload.batchInfo[Constants.BATCH_INSTALLATION_ID] = batchInstallId;
        }
        trackerPayload.trackerId = trackerPayload.batchInfo[Constants.EXECUTION_TRACKER_ID];
        CommonUtils.addProgressTracker(inputPayload, trackerPayload, id, type, mode);
        return trackerPayload;
    },
    
    getOptionalApps: function(selectedOptionalApps) {
		var optionals = null;
		if(selectedOptionalApps && selectedOptionalApps.length > 0 ) {
			optionals = [];
			for(var i = 0; i < selectedOptionalApps.length; i++)
				optionals.push(selectedOptionalApps[i].split(":")[0]);
		}
		return optionals;
	},
    

    installApp: function(params) {
        var queryParams = params.queryParams || {};
        var applicationId, response;
        var isReinstall = queryParams['isReinstall'] || false;
        var jumboConfig = JSON.parse(queryParams['jumbo_config'] || "{}");
        if (!this.useQueuedInstall) {
            applicationId = queryParams.app_id;
            response = this.appUpgarder.installAndUpdateApps(queryParams);
        } else {
            var inputPayload = this._getApplicationParams(params.queryParams);
            var applicationId = inputPayload.appId;
            var version = inputPayload.version;
            var customizationVersion = inputPayload.customizationVersion;
            var loadDemoData = inputPayload.loadDemoData;
            if(Object.keys(jumboConfig).length > 0) {
            	var optionals = this.getOptionalApps(jumboConfig.selectedOptionals);
            	response = isReinstall ? AppManagerAPI.repairApplicationV2(applicationId, version, customizationVersion, loadDemoData, jumboConfig.source, optionals) : 
            	AppManagerAPI.installApplicationV2(applicationId, queryParams[Constants.VERSION], customizationVersion, loadDemoData, jumboConfig.source, optionals);
            } else {
            	response = isReinstall ? AppManagerAPI.repairApplication(applicationId, version, customizationVersion, loadDemoData) :
                AppManagerAPI.installApplication(applicationId, version, customizationVersion, loadDemoData);
			}
        }
        return this._trackAndBuildResponse(queryParams, response, applicationId, Constants.APPLICATION, isReinstall ? Constants.REINSTALL : Constants.INSTALL);
    },

    updateApp: function(params) {
        var queryParams = params.queryParams || {};
        var applicationId, response;
		var jumboConfig = JSON.parse(queryParams['jumbo_config'] || "{}");
        if (!this.useQueuedInstall) {
            applicationId = queryParams.app_id;
            response = this.appUpgarder.installAndUpdateApps(queryParams);
        } else {
            var inputPayload = this._getApplicationParams(params.queryParams);
            var applicationId = inputPayload.appId;
            var version = inputPayload.version;
            var customizationVersion = inputPayload.customizationVersion;
            var loadDemoData = inputPayload.loadDemoData;
            if(Object.keys(jumboConfig).length > 0) {
            	var optionals = this.getOptionalApps(jumboConfig.selectedOptionals);
            	response = AppManagerAPI.updateApplicationV2(applicationId, version, customizationVersion, loadDemoData, jumboConfig.source, optionals);
            } else {
            	response = AppManagerAPI.updateApplication(applicationId, version, customizationVersion, loadDemoData);
            }
        }
        return this._trackAndBuildResponse(queryParams, response, applicationId, Constants.APPLICATION, Constants.UPDATE);
    },

    repairApp: function(params) {
        var queryParams = params.queryParams || {};
        queryParams.isReinstall = true;
        var applicationId, response;
        if (!this.useQueuedInstall) {
            applicationId = queryParams.app_id;
            response = this.appUpgarder.installAndUpdateApps(queryParams);
        } else {
            var inputPayload = this._getApplicationParams(params.queryParams);
            var applicationId = inputPayload.appId;
            var version = inputPayload.version;
            var customizationVersion = inputPayload.customizationVersion;
            var loadDemoData = inputPayload.loadDemoData;
            response = AppManagerAPI.repairApplication(applicationId, version, customizationVersion, loadDemoData);
        }
        return this._trackAndBuildResponse(queryParams, response, applicationId, Constants.APPLICATION, Constants.REPAIR);
    },

    activatePlugin: function(params) {
        var inputPayload = this._getPluginParams(params.queryParams);
        var pluginId = inputPayload.pluginId;
        var customizationVersion = inputPayload.customizationVersion;
        var loadDemoData = inputPayload.loadDemoData;
        var response = AppManagerAPI.activatePlugin(pluginId, customizationVersion, loadDemoData);
        return this._trackAndBuildResponse(inputPayload, response, pluginId, Constants.PLUGIN, Constants.ACTIVATE);
    },

    repairPlugin: function(params) {
        var inputPayload = this._getPluginParams(params.queryParams);
        var pluginId = inputPayload.pluginId;
        var customizationVersion = inputPayload.customizationVersion;
        var loadDemoData = inputPayload.loadDemoData;
        var response = AppManagerAPI.repairPlugin(pluginId, customizationVersion, loadDemoData);
        return this._trackAndBuildResponse(inputPayload, response, pluginId, Constants.PLUGIN, Constants.REPAIR);
    },

    installProduct: function(installationPlan, type) {
        var productId = installationPlan.product_id;
        var response = {};
        if (!this.useQueuedInstall)
            response = this.appUpgarder.installProductByPlan(installationPlan);
        else
            response = AppManagerAPI.installBatch(JSON.stringify(installationPlan));
        if (type && type.toLowerCase() === Constants.APPLICATION) {
            type = Constants.APPLICATION;
            gs.warn('Install plan: ' + JSON.stringify(installationPlan));
        } else {
            type = Constants.PRODUCT;
        }
        return this._trackAndBuildBatchResponse(installationPlan, response, productId, type, Constants.INSTALL);
    },

    _isBaseOnlyInstall: function(version, installedVersion, customizationVersion, installedCustomizationVersion) {
        return version && version != installedVersion && customizationVersion == installedCustomizationVersion;
    },

    _isCustomizedInstall: function(version, installedVersion, customizationVersion, installedCustomizationVersion) {
        return customizationVersion && version == installedVersion && customizationVersion != installedCustomizationVersion;
    },

    _getApplicationParams: function(queryParams) {
        var appId = queryParams[Constants.APP_ID] || '';
        var loadDemoData = queryParams[Constants.LOAD_DEMO_DATA] ? CommonUtils.getBooleanParam(queryParams, Constants.LOAD_DEMO_DATA) : false;
        var version = queryParams[Constants.VERSION] || '';
        var customizationVersion = queryParams[Constants.CUSTOMIZATION_VERSION] || '';
        if (Constants.NONE == customizationVersion.toLowerCase())
            customizationVersion = '';
        var installedVersion = CommonUtils.getInstalledVersion(appId);
        var installedCustomizationVersion = CommonUtils.getInstalledCustomizationVersion(appId) || '';
        var isReinstall = queryParams['isReinstall'] || false;

        if (this._isBaseOnlyInstall(version, installedVersion, customizationVersion, installedCustomizationVersion))
            customizationVersion = '';
        else if (!isReinstall && this._isCustomizedInstall(version, installedVersion, customizationVersion, installedCustomizationVersion))
            version = '';

        return {
            appId: appId,
            version: version,
            customizationVersion: customizationVersion,
            loadDemoData: loadDemoData,
        };
    },

    _getPluginParams: function(queryParams) {
        var customizationVersion = queryParams[Constants.CUSTOMIZATION_VERSION] || '';
        if (Constants.NONE == customizationVersion.toLowerCase())
            customizationVersion = '';
        return {
            pluginId: queryParams[Constants.PLUGIN_ID_PARAM] || '',
            customizationVersion: customizationVersion,
            loadDemoData: queryParams[Constants.LOAD_DEMO_DATA] ? CommonUtils.getBooleanParam(queryParams, Constants.LOAD_DEMO_DATA) : false
        };
    },

    type: 'AppManagerHandler'
};
