var AppsData = Class.create();
AppsData.prototype = {
	
	CANNOT_READ_MESSAGE : "Insufficient privileges to read records from table {0}",
		
	initialize: function(isMaint) {
		this.versionComparator = new VersionComparator();
		this.domainName = new ScopedAppRepoRequest().getUploadUrl();
		this.validScopeKeys = gs.getProperty("sn_appauthor.all_company_keys", gs.getProperty("glide.appcreator.company.code")).split(",");
		/*Add "x_ to all valid scope keys"*/
		this.validScopeKeys = this.validScopeKeys.map(function(key, index) {
			var validScopeTemplate = "x_{0}_";
			return validScopeTemplate.replace("{0}", key.toLowerCase());
		});
		this.validScopeKeys.push("sn_");
		this.validScopeKeys.push("global");
		this.instanceId = gs.getProperty("instance_id");
		this.storeDetailButtons = {
			"get": gs.getMessage("Get"),
			"buy": gs.getMessage("Buy"),
			"try": gs.getMessage("Try"),
			"request-app": gs.getMessage("Request App"),
			"request-trial": gs.getMessage("Request Trial"),
			"request-demo": gs.getMessage("Request a Demo"),
			"app-requested": gs.getMessage("App Requested"),
			"app-request-rejected": gs.getMessage("App Request Rejected"),
			"purchased": gs.getMessage("Purchased"),
			"trial-requested": gs.getMessage("Trial Requested"),
			"trial-rejected": gs.getMessage("Trial Rejected"),
			"trial-expiry-date": gs.getMessage("Trial Expires on "),
			"trial-expired": gs.getMessage("Trial Expired"),
			"trial-deactivated": gs.getMessage("Trial Deactivated"),
			"quote-requested": gs.getMessage("Quote Requested"),
			"purchase-with-po": gs.getMessage("Purchase with PO"),
			"cancel-quote": gs.getMessage("Cancel Quote"),
			"resend-quote": gs.getMessage("Resend Quote"),
			"po-submitted": gs.getMessage("PO Submitted"),
			"complete-purchase": gs.getMessage("Complete Purchase"),
			"view-company-profile": gs.getMessage("View Company Profile"),
			"request-install": gs.getMessage("Request Install"),
			"view-requests": gs.getMessage("View Requests"),
			"contact-seller": gs.getMessage("Contact Seller"),
			"view-product": gs.getMessage("View Products"),
			"go-to-install": gs.getMessage("Go to install")
		};
		this.indicatorMessages = {
			"service_graph_certified": gs.getMessage("Service Graph Certified"),
			"submitted_purchase_order": gs.getMessage("Processing Submitted Purchase Order"),
			"pending_purchase_status": gs.getMessage("Please Complete Purchase in Store"),
			"expecting_purchase_order": gs.getMessage("Expecting Purchase Order"),
			"approved_purchase_request": gs.getMessage("Approved Purchase Request"),
			"approved_trial_request": gs.getMessage("Approved Trial Request"),
			"processing_purchase_request": gs.getMessage("Processing Purchase Request"),
			"processing_trial_request": gs.getMessage("Processing Trial Request"),
			"processing_quote_request": gs.getMessage("Processing Quote Request"),
			"rejected_purchase_request": gs.getMessage("Rejected Purchase Request"),
			"rejected_trial_request": gs.getMessage("Rejected trial request"),
		};
		this.termsAndConditionMap = {
			"servicenow_terms_of_use": gs.getMessage("ServiceNow Store Terms Of Use"),
			"servicenow_terms_of_use_beta": gs.getMessage("ServiceNow Store Beta Terms Of Use"),
			"vendor_terms_and_conditions": gs.getMessage("Vendor App Subscription Terms and Conditions"),
			"innovation_lab_app_addendum": gs.getMessage("ServiceNow Innovation Lab App Addendum"),
			"servicenow_store_app_addendum": gs.getMessage("ServiceNow Store App Addendum")
		};
		this.infoMessagesMap = {
			"trial_not_allowed_on_prod": gs.getMessage("You are on a production instance. The trial is active but is only allowed on your sub production instances."),
			"purchase_requested": gs.getMessage("Your purchase request has already been submitted."),
			"purchase_requested_other_version": gs.getMessage("An app request has been made on another version of this app and is pending review/purchase."),
		};
		this.storeFilterIndicators = this.generateFilterIndicatorObject();
		this.listOfAppsWithNoInstalledFromInfo = {};
		this.isFirstLoad = false;
		this.overrideButtonToLinks = ["contact-seller", "view-company-profile"];
		this.glideAppLoader = new GlideAppLoader();
		this.isMaint = !!isMaint;
		this.pluginData = new global.PluginsData();
	},
	generateFilterIndicatorObject: function() {
		var indicatorObj = {};
		var i = 0;
		for (var indicator in this.indicatorMessages) {
			indicatorObj[indicator] = {
				id: indicator,
				message: this.indicatorMessages[indicator],
				order: i
			};
			i++;
		}
		return indicatorObj;
	},

/*
   Connect to store to get all store apps. This payload includes
   1. All store apps in e-commerce interface
   2. Recommended store apps.
   */
	getAllStoreApps: function() {
        if(gs.getProperty("sn_appclient.client_calls_allowed","false") == "false" || gs.getProperty("sn_appclient.app.install.offline","true") == "true") {
                gs.info("getAllStoreApps returning without calling repo as client_calls_allowed is false");
                return {data: {}};
        }
	
	    var allStoreAppsRequest = new ScopedAppRepoRequest("get_store_apps");
	        allStoreAppsRequest.setParameter("instance_id", gs.getProperty("instance_id")),
	        candidateStoreApps = allStoreAppsRequest.post(),
	        allStoreAppsRequestStatusCode = allStoreAppsRequest.getStatusCode(),
	        response = {data: {}};
	    if(allStoreAppsRequestStatusCode == 200) {
	        response.data = new global.JSON().decode(candidateStoreApps);
		this.localizeFilterIndicators(response.data.apps);
	    }
	    response.statusCode = allStoreAppsRequestStatusCode;
	    return response;
	},

	localizeFilterIndicators: function(data) {
		if (data.errors) {
			gs.error(data.message + " : " + data.errors[0]);
			return;
		}

		data.forEach(function(app) {
			if(app.filterIndicators)
				app.filterIndicators.forEach(function(indicator, index) {
					app.filterIndicators[index] = this.storeFilterIndicators[indicator] ? this.storeFilterIndicators[indicator] : indicator;
				}, this);
		}, this);
	},
	
	getStoreFilters: function() {
        if(gs.getProperty("sn_appclient.client_calls_allowed","false") == "false" || gs.getProperty("sn_appclient.app.install.offline","true") == "true") {
                gs.info("getStoreFilters returning without calling repo as client_calls_allowed is false");
                return {data: {}};
        }
	
	    var allStoreFilters = new ScopedAppRepoRequest("get_store_filters");
	        allStoreFilters.setParameter("instance_id", gs.getProperty("instance_id")),
	        candidateStoreApps = allStoreFilters.post(),
	        allStoreFiltersStatusCode = allStoreFilters.getStatusCode(),
	        response = {data: {}};
	    if(allStoreFiltersStatusCode == 200)
	        response.data = new global.JSON().decode(candidateStoreApps);
	    response.statusCode = allStoreFiltersStatusCode;
	    return response;
	},

	getAllApps: function(){
        new UpdateChecker().checkAvailableUpdates();
		var apps = [];
		this._addNewApps(apps);
		this._addInstalledApps(apps);
		var custom = [];
		this._addCustomApps(custom);
		return {
			data: apps,
			custom: custom
		};
	},

    getCustomApps: function(){
        var custom = [];
        this._addCustomApps(custom);
        return {
        	custom: custom
        };
    },

    getLatestAppBlockStatus: function(sourceAppId, version) {
		var result = {"blockInstall": true};
		new UpdateChecker().checkAvailableUpdates(true, true);
		var gr = new GlideRecord("sys_app_version");
		gr.addQuery("source_app_id", sourceAppId);
		gr.addQuery("version", version);
		if (!gs.getUser().hasRole("maint")){
			versions.addQuery("hide_on_ui", false);
		}
		gr.query();
		if(!gr.next())
			return result;

		result.blockInstall = gr.block_install.toString() === "true";
		if(result.blockInstall) {
			result.blockMessage = gr.getValue("block_message");
			result.appCompatibility = gr.getValue("compatibilities") ? gr.getValue("compatibilities").split(",") : [];
			result.instanceOnBuild = gs.getProperty("glide.buildname");
		}

		return result;
	},

	getAllAppsFromLocal: function(sharedInternally, isFirstLoad, hideOnUiAppScope, sysIdList) {
		var starttime = new GlideDateTime().getNumericValue();
		var apps = [];
		this.hideOnUiAppScope = hideOnUiAppScope;
		var inActiveAppSysIdMap = this._addInactiveInstalledApps(apps, sharedInternally);
		this._addNewApps(apps, sharedInternally, inActiveAppSysIdMap, sysIdList);
		this._addInstalledApps(apps, sharedInternally, sysIdList);
		this._addVersionsToApps(apps);
        var endtime = new GlideDateTime().getNumericValue();
		return {
			data: apps,
			appServer: gs.getProperty("sn_appclient.store_base_url", "http://localhost:8080/"),
            dataProcessingTime: endtime - starttime,
            storeURL: this.domainName
		};
	},
	
	getAllAppsWithVersions: function(sharedInternally, isFirstLoad, hideOnUiAppScope, forceUpdate){
		var cachedStoreAppResponse = sharedInternally ? null : new global.AppManagerCache().getResponseFromCache("storeResponse", sharedInternally);
		if(gs.nil(cachedStoreAppResponse) || cachedStoreAppResponse.data.length == 0 || forceUpdate || !this._userHasRolesForInstall()) {
			var localResponse = this.getAllAppsFromLocal(sharedInternally, isFirstLoad, hideOnUiAppScope);
			new global.AppManagerCache().putResponseInCache("storeResponse", localResponse, sharedInternally);
			cachedStoreAppResponse = localResponse;
			cachedStoreAppResponse['servedFromDB'] = true;
		}

		if(isFirstLoad) {
			var storeSyncTrackerId = this.checkUpdatesFromStore(sharedInternally);
			cachedStoreAppResponse['storetrackerId'] = storeSyncTrackerId;
		}

		return cachedStoreAppResponse;
	},

	_userHasRolesForInstall: function() {
		return gs.hasRole("admin") || gs.hasRole("maint") || gs.hasRole("sn_appclient.app_client_user");
	},

	putStoreResponseInAppManagerCache: function(sharedInternally, appMap, forceUpdate) {
		var sysIdList = [];
		if(!gs.nil(appMap))
			sysIdList = Object.keys(appMap);

		var cachedStoreAppResponse = new global.AppManagerCache().getResponseFromCache("storeResponse", sharedInternally);
		var localResponse = {};
		if(gs.nil(cachedStoreAppResponse) || cachedStoreAppResponse.data.length == 0 || forceUpdate || sysIdList.length == 0) {
			localResponse = this.getAllAppsFromLocal(sharedInternally, false, false);
			new global.AppManagerCache().putResponseInCache("storeResponse", localResponse, sharedInternally);
		} else {
			localResponse = this.getAllAppsFromLocal(sharedInternally, false, false, sysIdList);
			this.updateAppsInCache(localResponse, sharedInternally);
		}
	},

	updateAppsInCache: function(localResponse, sharedInternally) {
		if(gs.nil(localResponse) || gs.nil(localResponse.data) || localResponse.data.length == 0)
			return;

		var args = {};
		args.specificAppsToUpdate = [];
		args.sharedInternally = sharedInternally;
		args.appsList = localResponse.data;

		localResponse.data.forEach(function(app){
			args.specificAppsToUpdate.push({
				sourceAppId: app.sys_id
			});
		});

		new global.AppManagerCache().removeAndAppendCorrectAppsInCache(args);
	},

	_addNewApps: function(/*[]*/ apps, sharedInternally, inActiveAppSysIdMap, sysIdList) {
		var appDetails = new GlideRecordSecure('sys_remote_app');
		appDetails.addQuery("shared_internally", sharedInternally);
		appDetails.addNullQuery("contains_plugins").addOrCondition("contains_plugins", false);
        appDetails.orderByDesc('sys_created_on');
        if (!gs.nil(sysIdList) && sysIdList.length > 0) {
            appDetails.addQuery("sys_id", "IN", sysIdList.join());
        }

        appDetails.query();
        while(appDetails.next()) {
            if (this.isVisible(appDetails)){
		var app = this._getAppDetails(appDetails);
		if(inActiveAppSysIdMap[app.sys_id])
		   app.is_uninstalled_with_retain_data = true;
                apps.push(app);
	    }
			
        }
		
		// Assumes no store app is ever deleted from the store
		appDetails = new GlideRecordSecure('sys_store_app');
        appDetails.addActiveQuery();
        appDetails.addNullQuery('version');
        appDetails.addQuery("shared_internally", sharedInternally);
		appDetails.addNullQuery("contains_plugins").addOrCondition("contains_plugins", false);
	appDetails.addQuery("parent_app", null);
        appDetails.orderByDesc('sys_created_on');
        if (!gs.nil(sysIdList) && sysIdList.length > 0) {
            appDetails.addQuery("sys_id", "IN", sysIdList.join());
        }
        appDetails.query();
        while(appDetails.next()) {
            if (this.isVisible(appDetails))
                apps.push(this._getAppDetails(appDetails));
        }
	},
	
	_addInstalledApps: function(/*[]*/ apps, sharedInternally, sysIdList, useGlideRecord) {
        //DEF0334116:Made a flag to use GlideRecord instead of GlideRecordSecure if the call is made from AppUpgrader, post installation.
        var appDetails = useGlideRecord? new GlideRecord('sys_store_app'): new GlideRecordSecure('sys_store_app');
		appDetails.addNullQuery("contains_plugins").addOrCondition("contains_plugins", false);
	appDetails.addQuery("parent_app", null);
        if(sharedInternally){
        	appDetails.addQuery("shared_internally",sharedInternally);
        }else{
        	var gc = appDetails.addNullQuery("shared_internally");
        	gc.addOrCondition("shared_internally",sharedInternally);
        }
		
        if (!gs.nil(sysIdList) && sysIdList.length > 0) {
            appDetails.addQuery("sys_id", "IN", sysIdList.join());
        }
        appDetails.addActiveQuery();
        appDetails.addNotNullQuery('version');
        appDetails.orderByDesc('update_date');
        appDetails.query();
        while (appDetails.next()) {
        	this.captureAppsWithNoLastInstalledFrom(appDetails);
        	if (!this.isVisible(appDetails))
        		continue;
        	var canInstallOrUpgrade = this._canInstallOrUpgrade(appDetails);
        	if (!gs.hasRole("admin") &&
        		!gs.hasRole("sn_appclient.app_client_user") &&
			!gs.hasRole("maint") &&
			!this.isMaint &&
			!canInstallOrUpgrade) {
			continue;
        	}
        	apps.push(this._getAppDetails(appDetails));
		}
        this.updateAppstorePlugins();
	},
	
    _addInactiveInstalledApps: function(/*[]*/ apps, sharedInternally) {
    	  var inActiveAppSysIdMap = {};
        var appDetails = new GlideRecordSecure('sys_store_app');
        var appDetailsBuilder = appDetails.addQuery("shared_internally", sharedInternally);
        if(!sharedInternally)
            appDetailsBuilder.addOrCondition("shared_internally", "=", "NULL");
        appDetails.addQuery("active", false);
        appDetails.addNotNullQuery('version');
        appDetails.orderByDesc('update_date');
        appDetails.query();
        while(appDetails.next()) {
	      var isRemoteUpdateAvailable = this._isRemoteUpdateAvailable(appDetails);
	      var isVisible = this.isVisible(appDetails);
            if (!isRemoteUpdateAvailable && isVisible)
                apps.push(this._getAppDetails(appDetails));
            else if (isRemoteUpdateAvailable && isVisible)
            	 inActiveAppSysIdMap[appDetails.getValue("sys_id")] = true;
        }
        return inActiveAppSysIdMap;
    },
	
    _isRemoteUpdateAvailable: function(appDetails) {
        var sysRemoteApp = new GlideRecord("sys_remote_app");
        sysRemoteApp.get(appDetails.getValue("sys_id"));
        
        return sysRemoteApp.isValid();
    },
    
    _addCustomApps: function(/*[]*/ custom) {
        var customApps = new GlideRecordSecure('sys_app');
        if(customApps.isValid()) {
            customApps.orderByDesc('sys_created_on');
            customApps.query();
            while(customApps.next()) {
                custom.push(this._getAppDetails(customApps));
            }
        } else {
            gs.info(gs.getMessage(this.CANNOT_READ_MESSAGE, 'sys_app'));
        }
    },

	_addVersionsToApps: function(/*array*/ apps) {
		var i;
		for(i=0; i<apps.length; i++) {
			app = apps[i];
			this._addAppVersions(app);
		}
	},

	_addAppVersions: function(/*{app}*/ app) {
		app.versions = [];
		var versions = new GlideRecord("sys_app_version");
		versions.addQuery("source_app_id", app.sys_id);
		versions.query();
		if (!gs.getUser().hasRole("maint")){
			versions.addQuery("hide_on_ui", false);
		}
		while (versions.next()) {
			var has_manifest = !gs.nil(versions.getValue("manifest")) && versions.manifest.contains('app_info');
            		if(app.version && app.version == versions.getValue("version")) {
				app.has_manifest = this.isInstanceOffline() ? false : true;
            		} else if (app.latest_version && app.latest_version == versions.getValue("version")) {
				app.has_manifest = this.isInstanceOffline() ? false : true;
            		}
			//remember app is *NOT* a GlideRecord
			if (this.versionComparator.isDowngrade(app.version, versions.getValue("version")))
				continue;

			var tempObj = {};
			if(versions.isValidField('needs_app_engine_licensing'))
				tempObj.needs_app_engine_licensing = versions.needs_app_engine_licensing ? true : false;
			if(versions.isValidField('custom_table_count'))
				tempObj.custom_table_count = versions.custom_table_count.toString();
			tempObj.auto_update = versions.getValue("auto_update");
			tempObj.demo_data = versions.getValue("demo_data") == "has_demo_data" ? true : false;
			tempObj.dependencies = versions.getValue("dependencies");
			tempObj.name = versions.getValue("name");
			tempObj.number = versions.getValue("number");
			tempObj.publish_date = versions.getValue("publish_date");
			tempObj.publish_date_display = versions.getValue("publish_date");
			tempObj.remote_application = versions.getValue("remote_application");
			tempObj.scope = versions.getValue("scope");
			tempObj.short_description = versions.getValue("short_description");
			tempObj.source_app_id = versions.getValue("source_app_id");
			tempObj.sys_id = versions.getValue("sys_id");
			tempObj.title = versions.getValue("title");
			tempObj.vendor = versions.getValue("vendor");
			tempObj.vendor_key = versions.getValue("vendor_key");
			tempObj.version = versions.getValue("version");
			tempObj.block_install = versions.block_install ? true: false;
			tempObj.block_message = versions.getValue("block_message");
            tempObj.compatibilities = versions.compatibilities.toString();
			tempObj.version_display = this._getMajorAndMinorDisplayVersion(tempObj.version);
            tempObj.store_link = versions.getValue("is_store_app") ?
                    this._getStoreLink(tempObj.source_app_id, tempObj.version) : "";
		        tempObj.has_manifest = this.isInstanceOffline() ? false : true;
			//add a pretty display date for publish_date
			tempObj.price_type = versions.getValue("price_type") || "";
			tempObj.lob = new global.JSON().decode(versions.getValue("lob")) ? new global.JSON().decode(versions.getValue("lob")) : [];
			tempObj.indicators = new global.JSON().decode(versions.getValue("indicators")) ? new global.JSON().decode(versions.getValue("indicators")) : [];
			tempObj.display_message = versions.getValue("display_message") || "";
			tempObj.upload_info = versions.getValue("upload_info") || "";
			if (tempObj.publish_date) {
				var displayDate = new GlideDate();
				displayDate.setValue(tempObj.publish_date.toString());
				tempObj.publish_date_display = displayDate.getDisplayValueLang("medium");
			}
			tempObj.contains_plugins = versions.getValue("contains_plugins") == '1';
			if(tempObj.contains_plugins) {
				tempObj.application_configs = this.getApplicationConfiguration(tempObj.source_app_id, tempObj.version);
				tempObj.optional_apps_available = tempObj.optional_apps_available || tempObj.application_configs.config_available_to_install;
			}
			
			app.versions.push(tempObj);
		}

		var that = this;
		app.versions.sort(function (a, b) {
			if (that.versionComparator.isDowngrade(a.version, b.version))
				return 1;

			if (that.versionComparator.isUpgrade(a.version, b.version))
				return -1;

			if (that.versionComparator.isEqual(a.version, b.version))
				return 0;
		});


		for (var i=0; i<app.versions.length; i++) {
			app.versions[i].sortable_version = i + 1;
		}
	},

	getApplicationConfiguration: function(jumboSourceAppId, jumboVersion) {
	    var rowMapper = ['sys_id', 'conditional_dependencies', 'hard_dependencies', 'name', 'optional_dependencies', 'source', 'version', 'soft_dependencies'];
	    var jumboApplicationConfigQuery = "source_app_id=" + jumboSourceAppId + "^version=" + jumboVersion + "^type=offering";
	    var uninstalledApplicationConfigs = AppsDAO.getApps({
	        "encodedQuery": jumboApplicationConfigQuery
	    }, "sys_remote_scoped_plugin", rowMapper);
	    jumboApplicationConfigQuery = "parent_scope_id=" + jumboSourceAppId + "^version=" + jumboVersion + "^type=offering^active=true";
	    rowMapper.push("scope");
	    var installedApplicationConfigs = AppsDAO.getApps({
	        "encodedQuery": jumboApplicationConfigQuery
	    }, "sys_scoped_plugin", rowMapper, {
	        "scope": true
	    });
	    var applicationConfigs = {
	        apps: [],
	        config_available_to_install: false,
	    };
	    var i = 0;
	    for (i = 0; i < installedApplicationConfigs.apps.length; i++) {
	        installedApplicationConfigs.apps[i].name = installedApplicationConfigs.apps[i].name + "( Installed )";
	        installedApplicationConfigs.apps[i].source_app_id = jumboSourceAppId;
	        installedApplicationConfigs.apps[i].is_appconfig_installed = true;
	        applicationConfigs.apps.push(installedApplicationConfigs.apps[i]);
	    }
	    for (i = 0; i < uninstalledApplicationConfigs.apps.length; i++) {
	    	uninstalledApplicationConfigs.apps[i].source_app_id = jumboSourceAppId;
	    	applicationConfigs.config_available_to_install = installedApplicationConfigs.apps.length > 0;
	    	applicationConfigs.apps.push(uninstalledApplicationConfigs.apps[i]);
	    }


	    return applicationConfigs;
	},

	_getProductsList: function(productFamilyList) {
		productFamilyList = JSON.parse(productFamilyList) || [];
		var products = [];
		var addedProductIds = {};
		for(var i in productFamilyList) {
			for(var j in productFamilyList[i].productList) {
				var productObj = productFamilyList[i].productList[j];
				if(addedProductIds.hasOwnProperty(productObj.productId) && addedProductIds[productObj.productId])
					continue;
				products.push(productObj);
				addedProductIds[productObj.productId] = true;
			}
		}
		return products;
	},
	
	getLogo: function(/*GlideRecord sys_remote_app | sys_store_app | sys_app */ appDetails) {
		var logo = "";
		if(!this.isInstanceOffline() && (appDetails.getValue("sys_class_name") != 'sys_app') && appDetails.getValue("logo") && (appDetails.getValue("logo") != 'undefined'))
			logo = this.getStoreURL() + appDetails.logo.toString() + ".iix" ;
		
		if (!logo) {
			var logoGR = new GlideRecord('sys_attachment');
			logoGR.addQuery('table_sys_id', appDetails.sys_id.toString());
			logoGR.addQuery('file_name', 'logo');
			logoGR.query();
			if (logoGR.next())
				logo = logoGR.getValue("sys_id")+".iix";
		}
		return logo;
		
	},
	_appendStudioURL: function(appDetails) {
		var edit_in_studio_url = "";
		var open_in_studio_url = "";

		try {
			// Check if UDC StudioUtils is available
			if (typeof sn_udc.StudioUtils !== 'undefined') {
				try {
					var studioAppDetailsPageURL = sn_udc.StudioUtils.getAppDetailsPageURL(appDetails.sys_id);

					if (studioAppDetailsPageURL) {
						open_in_studio_url = studioAppDetailsPageURL;
						edit_in_studio_url = studioAppDetailsPageURL;
					} else {
						// Studio App Details URL could not be generated. Falling back to home page URL
						open_in_studio_url = sn_udc.StudioUtils.getHomePageURL();
						edit_in_studio_url = open_in_studio_url;
					}
				} catch(error) {
					// Unknwon error - Falling back to home page URL
					open_in_studio_url = sn_udc.StudioUtils.getHomePageURL();
					edit_in_studio_url = open_in_studio_url;
				}
			} else {
				// UDC StudioUtils not available. Using legacy static URL
				open_in_studio_url = this._constructLegacyStudioURL(appDetails, 'sys_id');
				edit_in_studio_url = this._constructLegacyStudioURL(appDetails, 'sys_id');
			}
		} catch (e) {
			// Log error and use fallback URL
			gs.error("Error in _appendStudioURL: " + e);
			open_in_studio_url = ""; // give empty URL and disable/hide button on UI
			edit_in_studio_url = open_in_studio_url;
		}

		// Set the URLs on the plugin object
		appDetails.edit_in_studio_url = edit_in_studio_url;
		appDetails.open_in_studio_url = open_in_studio_url;
	},

	_constructLegacyStudioURL: function(appDetails, idType) {
		// Constructs the legacy Studio URL based on the given ID type
		var id = appDetails[idType];
		return "/$studio.do?sysparm_transaction_scope=" + id + "&sysparm_nostack=true&sysparm_use_polaris=false";
	},

	_getAppDetails: function(/*GlideRecord sys_remote_app | sys_store_app | sys_app */ appDetails) {
		var tempobj = {};
		tempobj.logo = this.getLogo(appDetails);
		tempobj.short_description = appDetails.short_description.toString();
		if(appDetails.isValidField('needs_app_engine_licensing'))
			tempobj.needs_app_engine_licensing = appDetails.needs_app_engine_licensing ? true : false;
		if (appDetails.isValidField('build_version') && !gs.nil(appDetails.build_version) && appDetails.build_version.toString() !== '') {
			tempobj.build_version = appDetails.build_version.toString();
		}
		if (appDetails.isValidField('assigned_build_version') && !gs.nil(appDetails.assigned_build_version) && appDetails.assigned_build_version.toString() !== '') {
			tempobj.assigned_build_version = appDetails.assigned_build_version.toString();
		}
		if(appDetails.isValidField('custom_table_count'))
			tempobj.custom_table_count = appDetails.custom_table_count.toString();
		tempobj.name = appDetails.name.toString();
		tempobj.vendor = appDetails.vendor.toString();
		tempobj.vendor_prefix = appDetails.vendor_prefix.toString();
		tempobj.link = this._checkAppIsProperlyInstalled(appDetails) ? this._getAppLink(appDetails) : ""; //Link to the app should be given only when app is propertly installed.
		tempobj.scope = appDetails.scope.toString();
		tempobj.compatibilities = appDetails.compatibilities ? appDetails.compatibilities.toString() : "" ;
		tempobj.active = appDetails.isValidField('active') ? appDetails.active.toString() == 'true' : false;
		tempobj.price_type = appDetails.getValue("price_type") || "" ;
		tempobj.lob = new global.JSON().decode(appDetails.getValue("lob")) ? new global.JSON().decode(appDetails.getValue("lob")) : [];
		tempobj.source = appDetails.getValue("sys_class_name") ? appDetails.getValue("sys_class_name") : "";
		tempobj.shared_internally = appDetails.getValue("shared_internally");
		tempobj.indicators = new global.JSON().decode(appDetails.getValue("indicators")) ? new global.JSON().decode(appDetails.getValue("indicators")) : [];
		if (tempobj.indicators && tempobj.indicators.length > 0)
			tempobj.indicators.forEach(function(indicator){
				if ("not_licensed" == indicator.id)
						tempobj.entitled = 'no';
			});
		tempobj.display_message = appDetails.getValue("display_message");
		tempobj.upload_info = appDetails.getValue("upload_info") || "";
		tempobj.products = this._getProductsList(appDetails.getValue("products"));

		if(appDetails.getTableName() == "sys_app")
			tempobj.side_loaded = this._checkForSideLoading(appDetails);
		

		var install_date = null;
		if (appDetails.isValidField('install_date') && !appDetails.install_date.nil()) {
			install_date = new GlideDate();
			install_date.setValue(appDetails.install_date);
		} else if (appDetails.isValidField('version') && !gs.nil(appDetails.version)) {
			install_date = new GlideDate();
			install_date.setValue(appDetails.sys_created_on);
		}

		var update_date = '';
		if (appDetails.isValidField('update_date') && !appDetails.update_date.nil()) {
			update_date = new GlideDate();
			update_date.setValue(appDetails.update_date);
		}

		tempobj.install_date = gs.nil(install_date) ? '' : install_date.getDisplayValueLang("medium");
		tempobj.update_date = gs.nil(update_date) ? '' : update_date.getDisplayValueLang("medium");

		if ('sys_remote_app' == appDetails.getRecordClassName()) {
			tempobj.version = "";
			tempobj.assigned_version = "";
			if (!gs.nil(appDetails.latest_version)) {
				tempobj.latest_version = appDetails.latest_version.toString();
				tempobj.latest_version_display = this._getMajorAndMinorDisplayVersion(appDetails.latest_version.toString());
			} else {
				tempobj.latest_version = tempobj.version;
			}
			tempobj.block_install = appDetails.block_install ? true: false;
			tempobj.block_message = appDetails.block_message.toString();
			tempobj.uninstall_blocked = appDetails.uninstall_blocked ? true : false;
		} else {
			if(appDetails.guided_setup_guid && appDetails.guided_setup_guid.toString())
				tempobj.guided_setup_guid = appDetails.guided_setup_guid.toString();
			if (!gs.nil(appDetails.version)) {
				tempobj.version = appDetails.version.toString();
				tempobj.version_display = this._getMajorAndMinorDisplayVersion(appDetails.version.toString());
			} else
				tempobj.version = "";

			if (appDetails.isValidField('assigned_version') && !gs.nil(appDetails.assigned_version))
				tempobj.assigned_version = appDetails.getValue("assigned_version");
			else
				tempobj.assigned_version = tempobj.version;

			if (appDetails.isValidField('latest_version') && !gs.nil(appDetails.latest_version)) {
				//gs.debug("App: {0} Latest version: {1} Version: {2} ", appDetails.name.toString(), appDetails.latest_version.toString(), appDetails.version.toString());
				tempobj.latest_version = appDetails.latest_version.toString();
				tempobj.latest_version_display = this._getMajorAndMinorDisplayVersion(appDetails.latest_version.toString());
				// if the versions are in fact different, the UI must show a difference
				if (tempobj.version != tempobj.latest_version && tempobj.version_display == tempobj.latest_version_display)
					tempobj.latest_version_display = tempobj.latest_version;

				//gs.debug("tempobj is {0}", new global.JSON().encode(tempobj));
			} else {
				tempobj.latest_version = tempobj.version;
				tempobj.latest_version_display = tempobj.version_display;
				//gs.debug("App: {0} Set latest version to {1} and display to {2} ", appDetails.name, tempobj.version, tempobj.version_display);

			}
		}

		tempobj.demo_data = appDetails.isValidField('demo_data')
			? appDetails.demo_data.toString()
		: '';
		tempobj.sys_id = appDetails.sys_id.toString();
		tempobj.sys_updated_on = appDetails.sys_updated_on.toString();
		tempobj.sys_created_on = appDetails.sys_created_on.toString();

        var canCustomize = sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(tempobj.sys_id);
        var canEditInStudio = appDetails.can_edit_in_studio == true ? true : false;
        tempobj.can_edit_in_studio = canEditInStudio && canCustomize;

        tempobj.can_open_in_studio = !canEditInStudio && canCustomize;
		if(tempobj.can_edit_in_studio || tempobj.can_open_in_studio || appDetails.can_edit_in_studio){
			this._appendStudioURL(tempobj);
		}
		
        tempobj.is_customized_app = sn_app_customization.AppCustomizationAPI.isCustomizedAppOnAllAppsPage(tempobj.sys_id);
        tempobj.can_install_or_upgrade_customization = sn_app_customization.AppCustomizationAPI.canInstallOrRepairCustomization(tempobj.sys_id);

        tempobj.customized_version_info = sn_app_customization.AppCustomizationAPI.getCustomizationVersionInfo(tempobj.sys_id);
        if(tempobj.shared_internally == false)
		tempobj.customized_version_info.latest_customized_version = this._getLatestCustomizedVersion(tempobj.customized_version_info.customization_versions) || tempobj.customized_version_info.customized_version_default;

        tempobj.contains_unpublished_customizations = sn_app_customization.AppCustomizationAPI.containsUnpublishedCustomizations(tempobj.sys_id);

		var storeVersion = tempobj.version ? tempobj.version : tempobj.latest_version;
        tempobj.is_store_app = appDetails.is_store_app ? true: false;
        tempobj.store_link = tempobj.is_store_app ? this._getStoreLink(tempobj.sys_id, storeVersion) : "";

		var createdOn = new GlideClientDate();
		createdOn.setValue(appDetails.sys_created_on.toString());
		tempobj.sys_created_on_display = createdOn.getDisplayValue();

		var updatedOn = new GlideClientDate();
		updatedOn.setValue(appDetails.sys_updated_on.toString());
		tempobj.sys_updated_on_display = updatedOn.getDisplayValue();

		var displayDate;
		if ('sys_store_app' == appDetails.getRecordClassName()) {
			tempobj.isSubscriptionApplicable = (gs.hasRole("admin") || gs.hasRole("maint") || this.isMaint) && tempobj.needs_app_engine_licensing && GlideCustomTableUtils.getUnmappedTableCount("Application", appDetails.sys_id.toString()) > 0;
			if(tempobj.isSubscriptionApplicable)
				tempobj.inventoryURI = GlideCustomTableUtils.getInventoryURI("Application", appDetails.sys_id.toString());
			if (!appDetails.update_date.nil()) {
				displayDate = new GlideDate();
				displayDate.setValue(appDetails.update_date.toString());
				tempobj.publish_date_display = displayDate.getDisplayValueLang("medium");
			}
			tempobj.isAppstorePlugin =  sn_app_api.AppStoreAPI.isAppstorePlugin(appDetails.getValue("scope"), appDetails.getValue("sys_code"));
			tempobj.uninstall_blocked =  !this.glideAppLoader.canUninstall(appDetails.getValue("scope"), appDetails.getValue("sys_code"));
			tempobj.sys_code = appDetails.sys_code.toString();
		} else {
			displayDate = new GlideDate();
			var publishDate = appDetails.isValidField('publish_date')
			&& !appDetails.publish_date.nil() ? appDetails.publish_date.toString() : appDetails.sys_updated_on.toString();
			displayDate.setValue(publishDate);
			tempobj.publish_date_display = displayDate.getDisplayValueLang("medium");
			if (appDetails.isValidField("delivery_source"))
				tempobj.isAppstorePlugin = ["store","offline","out_of_band"].indexOf(appDetails.delivery_source.toString()) != -1;
		}

		tempobj.can_install_or_upgrade = this._canInstallOrUpgrade(appDetails);
		tempobj.isInstalled = tempobj.active && !gs.nil(tempobj.version);
		if(tempobj.isInstalled){
			var isLatestVersionHigher = new VersionComparator().isUpgrade(tempobj.version, tempobj.latest_version);
			tempobj.isInstalledAndUpdateAvailable = isLatestVersionHigher && tempobj.can_install_or_upgrade;

            var isLatestCustomizationVersionHigher = false;
            if (tempobj.customized_version_info.hasOwnProperty('currently_installed_customization'))
                isLatestCustomizationVersionHigher = new VersionComparator().isUpgrade(tempobj.customized_version_info.currently_installed_customization,  tempobj.customized_version_info.customized_version_default);
			tempobj.isCustomizationUpdateAvailable = isLatestCustomizationVersionHigher && tempobj.can_install_or_upgrade_customization;
		}
		if (appDetails.isValidField('installed_as_dependency'))
			tempobj.installed_as_dependency = appDetails.installed_as_dependency.toString() == "true" ?  true : false;
		//gs.debug("Including " + appDetails.getRecordClassName() + ": " + new global.JSON().encode(tempobj));
		var appScheduleDetails = new ScheduledInstallService().fetchActiveSchedulesForEntity({source_app_id: appDetails.sys_id.toString()});
		tempobj.app_schedule_details = CommonUtils.formatScheduleDetailsStartTime(appScheduleDetails, tempobj.sys_id);
		tempobj.dependencies = appDetails.getValue("dependencies");
		tempobj.contains_plugins = appDetails.getValue("contains_plugins") == '1';
		tempobj.optional_apps_available = appDetails.getValue("optional_apps_available") == '1';
		tempobj.sys_code = appDetails.getValue("sys_code");
		if (tempobj.contains_plugins) {
			tempobj.application_configs = this.getApplicationConfiguration(tempobj.sys_id, storeVersion);
			tempobj.optional_apps_available = tempobj.optional_apps_available || tempobj.application_configs.config_available_to_install;
		}
			
		return tempobj;
	},

	_getLatestCustomizedVersion: function(customizationVersionList) {
		if(!customizationVersionList || customizationVersionList.length == 0) {
			return null;
		}
		if(customizationVersionList.length == 1 && !customizationVersionList[0].value){
			return null;
		}
		customizationVersionList = customizationVersionList.map(function(version) {
			return version.value;
		}).filter(function(version) {
			return version.value != 'none';
		});
		return new VersionComparator().getLatestVersion(customizationVersionList);
	},
	
	_checkForSideLoading: function(app) {
		if(this.validScopeKeys.length === 0)
			return false;
		
		for( var keyIndex = 0; keyIndex < this.validScopeKeys.length; keyIndex++ ) {
			if(app.getValue("scope").toLowerCase().startsWith(this.validScopeKeys[keyIndex]))
				return false;
		}	
		
		return true;	
	},
	
	/*Redirect link to sys_store_app to handle apps that inactive in sys_store_app table and still have record in sys_remote_app */
	_getAppLink: function(appDetails) {
		var table = appDetails.getTableName();
		if(table == "sys_remote_app")
			table = "sys_store_app";  
		
		var link = "/" + table + ".do?sys_id=" + appDetails.sys_id
		
		return link;
	},

	_canInstallOrUpgrade: function(/*GlideRecord sys_remote_app | sys_store_app*/ appDetails) {
		if (GlidePluginManager.isActive("com.glide.app_api")) {
			if (typeof sn_app_api.AppStoreAPI.canInstallOrUpgrade != "undefined")
				return sn_app_api.AppStoreAPI.canInstallOrUpgrade(appDetails);
		}

		// admin or app_client_user is allowed to install or upgrade
		if (gs.hasRole('sn_appclient.app_client_user'))
			return true;

		return false;
	},

	_getMajorAndMinorDisplayVersion: function(val) {
		var ary = val.toString().split('.');
		if (ary.length <= 1)
			return val;

		if (ary[ary.length - 1].length >= 12)
			return val;

		if (ary.length >= 2 && ary[0] === 0 && ary[1] === 0)
			return val;

		while(ary[ary.length - 1] == 0)
			ary.pop();

		return ary.join('.');
	},

	_checkAppIsProperlyInstalled: function(appDetails) {
		var tableName = appDetails.getTableName();
		if (tableName == 'sys_remote_app') {
			var gr = new GlideRecord("sys_store_app");
			gr.get(appDetails.sys_id);
			if(gr.isValid() && !gr.active)
				return true;
			return false;
		}
		else if (tableName == 'sys_store_app') { // if app is aborted then also app is not properly installed so return false.
			if (appDetails.getValue('active') == '0') {
				var ga = new GlideAggregate('sys_metadata');
				ga.addQuery('sys_scope', appDetails.sys_id);
				ga.setGroup(false);
				ga.query();
				return ga.hasNext();
			}
		}
		return true;
	},

    _getStoreLink: function (source_app_id, version) {
        return this.domainName.replace("apprepo.service-now","store.servicenow") + "sn_appstore_store.do#!/store/application/"+source_app_id+"/"+version;
    },

    checkUpdatesFromStore : function(sharedInternally, args) {
		if(gs.nil(args))
			args = {};
		args.isMaint = gs.hasRole("maint");
    	 args.sharedInternally = sharedInternally;
    	 var storeSyncTrackerId = this.isStoreSyncInProgress();
		var honourChecksum = args.hasOwnProperty("honourChecksum") ? args.honourChecksum : true;
        var isInteractive = args.hasOwnProperty("isInteractive") ? args.isInteractive : true;
        if (!gs.nil(storeSyncTrackerId))
			return storeSyncTrackerId;
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName("Checking store app updates");
        worker.setBackground(true);
        worker.setCannotCancel(true);
        worker.setScriptIncludeName("sn_appclient.UpdateChecker");
        worker.setScriptIncludeMethod("checkAvailableUpdates");
        worker.putMethodArg("isInteractive", isInteractive);
        worker.putMethodArg("honourChecksum", honourChecksum);
		worker.putMethodArg("args", args);
        worker.start();
        return worker.getProgressID();
    },

    isStoreSyncInProgress : function(){
		var gr = new GlideRecord("sys_progress_worker");
		gr.addQuery("name","Checking store app updates");
		gr.addQuery("state",'IN',"starting,running");
		gr.orderByDesc("sys_created_on");
		gr.setLimit(1);
		gr.query();
		if (gr.next()){
			var currentDateTime = new GlideDateTime().getNumericValue();
			var progressWorkerCreatedTime = new GlideDateTime(gr.sys_created_on).getNumericValue();
			if ((currentDateTime - progressWorkerCreatedTime) > 3600000)
				return "";
			return gr.getUniqueValue();
		}
		return "";
	},

    entitleApp: function(sourceAppId, version, requestType){
        if(this.isInstanceOffline())
         	return;
	var request = new ScopedAppRepoRequest('entitle_app_on_instance');
	request.setParameter('source_app_id', sourceAppId);
	request.setParameter('version', version);
	request.setParameter('request_type', requestType);
	request.setParameter('user_name', gs.getUserName());
	request.post();
	var response = {data:{}};
	response.data.sourceAppId = sourceAppId;
	response.data.version = version;
	response.message = request.message;
	response.statusCode = request.getStatusCode();
	return response;
    },
    getSubscribedProductForApp: function(sourceAppId, version){
        if(this.isInstanceOffline())
		return [];
	var request = new ScopedAppRepoRequest('entitle_app_on_instance');
	request.setParameter('source_app_id', sourceAppId);
	request.setParameter('request_type', 'get_subscribed_products');
	var subscribedProducts = new global.JSON().decode(request.post());
	var productURL = this.getProductURL();
	var response = {};
	for (var i = 0 ; i <  subscribedProducts.length ; i++)
		subscribedProducts[i].url = productURL + subscribedProducts[i].productId;
	response.productList = subscribedProducts;
	response.status = request.getStatusCode();
	return response;
   },
   getProductURL: function(){
	var productURL = new ScopedAppRepoRequest().getUploadUrl();
	return productURL.replace("apprepo.service-now" , "store.servicenow") + "/sn_appstore_store.do#!/store/product/";
   },
   isInstanceOffline: function(){
	return gs.getProperty("sn_appclient.app.install.offline" , "true") == "true";
   },

	getAppRecord: function(sys_id, getActiveOnly) {
		if(gs.nil(getActiveOnly)) getActiveOnly = true;

		var gr = new GlideRecordSecure("sys_remote_app");
        	gr.addQuery("sys_id", sys_id);
		gr.addQuery("shared_internally", false).addOrCondition("shared_internally", null);
		gr.query();
		if(gr.next())
		    return gr;

		gr = new GlideRecordSecure("sys_store_app");
		gr.addQuery("sys_id", sys_id);
		getActiveOnly && gr.addQuery("active", true);
		gr.addQuery("shared_internally", false).addOrCondition("shared_internally", null);
		gr.query();
		if(gr.next())
		    return gr;

		return null;
	},
	
	updateAppStatusOnInstance: function(appData) {
		var sysId = appData.source_app_id ? appData.source_app_id : appData.id;
		var gr = this.getAppRecord(sysId);
		if(gr) {
			if(gr.getRecordClassName() == "sys_store_app")
				appData.isAppUpdateAvailable = new VersionComparator().isUpgrade(appData.version, appData.latest_version) ?  this._canInstallOrUpgrade(gr) : false;
			if(gr.getRecordClassName() == "sys_remote_app")
				appData.isAppInstallationAvailable = true;
			appData.isAppEntitledForInstance = true;
			appData.isAppCompatible = true;
			appData.appUrl = "$allappsmgmt.do?sysparm_search==" + gr.scope;
		}else
			appData.appUrl = this._getStoreLink(sysId, appData.version);
	},
	
	updateDependentAppStatusOnInstance: function(dependentApp) {
		if(!dependentApp.app_list)
			return;
		
		dependentApp.app_list.forEach(function(app) {
			this.updateAppStatusOnInstance(app);
		}.bind(this));
	},

	localizeAndSetTargetUrl: function(app) {
		if (app.error)
		    return;
		app.isInstalled = this.isAppInstalled(app);
		var connectedStoreInstance = this.domainName.replace("apprepo.service-now", "store.servicenow");
		app.storeAppButtons.forEach(function(btn) {
		    if (btn.id == "trial-expiry-date") {
			var gdt = new GlideDateTime(app.trialExpiryDate);
			btn.title = this.storeDetailButtons[btn.id] + gdt.getDate().getByFormat("MM/dd/yy");
 		    } else if(btn.id == "go-to-install" && app.isInstalled)
			btn.title = gs.getMessage("Manage Application");
		    else
 			btn.title = this.storeDetailButtons[btn.id];

		    if (!btn.disabled) {
			if (btn.redirect)
			    btn.targetUrl = connectedStoreInstance + btn.targetUrl + "&iid=" + this.instanceId;
			else {
				if(btn.id == "view-product") {
					var isAppPartOfSingleProduct = app.parentProducts.length == 1 && app.parentProducts[0].productList.length == 1;
					btn.targetUrl = isAppPartOfSingleProduct ? "$products.do?productId=" + app.parentProducts[0].productList[0].productId : "$products.do";
				}
				else
					btn.targetUrl = "$allappsmgmt.do?sysparm_search==" + app.scope;
			}
		    }
		}, this);
		if(app.termsAndConditions)
			app.termsAndConditions.forEach(function (termsAndCondition){
				termsAndCondition.URL = connectedStoreInstance + termsAndCondition.URL;
				if (this.termsAndConditionMap[termsAndCondition.id])
					termsAndCondition.title = this.termsAndConditionMap[termsAndCondition.id];
			}, this);
		if(app.infoMessages)
			app.infoMessages.forEach(function (infoMessage){
				if (this.infoMessagesMap[infoMessage.id])
					infoMessage.message = this.infoMessagesMap[infoMessage.id];
			}, this);
		app.storeAppLinks = [];
		var indexedStoreAppButton = app.storeAppButtons.map(function(ele) { return ele.id; });
		this.overrideButtonToLinks.forEach(function(link) {
			var overrideIndex = indexedStoreAppButton.indexOf(link);
			if(overrideIndex > -1)
				app.storeAppLinks.push(app.storeAppButtons.splice(overrideIndex, 1)[0]);
		}, this);
	},

	getStoreAppDetail: function(app_id, version, requiredForPurchase) {
		var result = {};
		if(this.isInstanceOffline()) {
			result.error = "client_call_not_allowed";
			return result;
		}
		var appDetail = new ScopedAppRepoRequest("get_store_app_detail")
		    .setParameter("app_id", app_id)
		    .setParameter("version", version)
		    .setParameter("for_purchase", requiredForPurchase);
		var response = appDetail.get();
		if(appDetail.getStatusCode() == 200 || appDetail.getStatusCode() == 400) {
			try {
				result = new global.JSON().decode(response)[0];
				this.localizeAndSetTargetUrl(result.appDetails);
				this.updateDependentAppStatusOnInstance(result.appDependency);
			} catch(e) {
				result = {};
				result.error = gs.getMessage("Error in processing app details at : {0}", e);
			}
		}else
			result.error = "no response returned";

		return result;
        },

	getStoreAppReview: function(app_id) {
		var result = {};
		if(this.isInstanceOffline()) {
			result.error = "client call not allowed";
			return result;
		}
		var appDetails = new ScopedAppRepoRequest("get_store_app_review").setParameter("app_id", app_id);
		var response = appDetails.get();
		if(appDetails.getStatusCode() == 200 || appDetail.getStatusCode() == 400)
			result = new global.JSON().decode(response);
		else
			result.error = "no response returned";
			
		return result;
        },

    isVisible : function (appDetails) {
		var isInstalledAppWithCustomizations = sn_app_customization.AppCustomizationAPI.isCustomizedAppOnAllAppsPage(appDetails.sys_id) && 'sys_store_app' == appDetails.getTableName();
		var canShowOnUI = appDetails.isValidField('hide_on_ui') && !appDetails.hide_on_ui;
		return gs.hasRole("maint") || this.isMaint || (canShowOnUI || isInstalledAppWithCustomizations ) || (this.hideOnUiAppScope && (appDetails.scope == this.hideOnUiAppScope) && appDetails.block_install);
    },

	getLatestErrorMessage: function(requestType) {
		var gr = new GlideRecord("sn_appclient_store_outbound_http_quota");
		gr.get("request_type", requestType);
		return gr.getValue("last_request_error_message") || "";
	},

	isAppstorePlugin : function(source_app_id) {
		var storeAppGr = new GlideRecord("sys_store_app");
		storeAppGr.addActiveQuery();
		storeAppGr.addQuery("sys_id", source_app_id);
		storeAppGr.query();
		if (storeAppGr.next())
			return sn_app_api.AppStoreAPI.isAppstorePlugin(storeAppGr.scope.toString(), storeAppGr.sys_code.toString());
		return null;
	},
	isAppInstalled : function(app) {
		var status = false;
		var sysId = app.source_app_id ? app.source_app_id : app.id;
		var gr = this.getAppRecord(sysId);
		if (gr)
		    status = (gr.getRecordClassName() == "sys_store_app");
		return status;
	},

	updateAppstorePlugins : function() {
		var appMap = this.listOfAppsWithNoInstalledFromInfo;
		var appSysIds = Object.keys(appMap);
		if (appSysIds.length == 0)
			return;

		var pluginsInfoMap = sn_app_api.AppStoreAPI.checkForAppstorePlugins(appMap);
		var pluginInfo;
		var store_app_sysids = Object.keys(pluginsInfoMap);
		if (store_app_sysids.length == 0)
			return;

		var storeAppGr = new GlideRecord("sys_store_app");
		storeAppGr.addQuery("sys_id", "IN", store_app_sysids);
		storeAppGr.addNullQuery('last_installed_from');
		storeAppGr.query();
		while(storeAppGr.next()){
			pluginInfo = pluginsInfoMap[storeAppGr.getUniqueValue()];
			storeAppGr.setValue("last_installed_from" , !pluginInfo["is_appstore_plugin"]? 'dist' : 'store' );
			if (!pluginInfo["is_appstore_plugin"] && !storeAppGr.hide_on_ui)
				storeAppGr.setValue('hide_on_ui' , !pluginInfo["is_published"]);
			storeAppGr.setWorkflow(false);
			storeAppGr.update();
		}
	},

	updateLastInstalledFrom: function() {
		var gr = new GlideRecord("sys_store_app");
		gr.addEncodedQuery("last_installed_from=^active=true");
		gr.query();

		while (gr.next()) {
			if (gs.nil(gr.getValue("last_installed_from"))) {
				key = gr.getValue("scope") + ":" + gr.getValue("sys_code");
				this.listOfAppsWithNoInstalledFromInfo[key] = gr.getUniqueValue();
			}
		}

		this.updateAppstorePlugins();
	},

	captureAppsWithNoLastInstalledFrom : function(appDetails){
		var key;
		if (gs.nil(appDetails.getValue("last_installed_from")) && this.isFirstLoad){
			key = appDetails.getValue("scope") + ":" + appDetails.getValue("sys_code");
			this.listOfAppsWithNoInstalledFromInfo[key] = appDetails.getUniqueValue();
		}
	},

	isMapped : function(app_id) {
		var scopeGR = new GlideRecord("sys_scope");
		if (!scopeGR.get(app_id))
			return false;

		var licenseID = scopeGR.getValue(CommonUtils.getLicenseColumn());
		return GlideStringUtil.notNil(licenseID);
	},

	canMap : function() {
		var encodedQuery = this.getValidSubscriptionsQuery();

		var tableName = this.getLicenseTableName();

		var tableGR = new GlideRecord(tableName);
		tableGR.addEncodedQuery(encodedQuery);
		tableGR.query();

		return tableGR.hasNext();
	},

	getLicenseTableName: function() {
		return sn_lef.GlideEntitlement.canRouteToEMS() ? "subscription_entitlement" : "license_details";
	},

	enforcePreinstallMapping : function() {
		return sn_lef.GlideEntitlement.isCustomAppSubscriptionMappingEnforced() && this.canMap();
	},
	
	getStoreURL: function() {
		return this.domainName.replace("apprepo.service-now", "store.servicenow");
	},

	getValidSubscriptionsQuery : function() {
		return sn_lef.GlideEntitlement.getEligibleCustomAppSubscriptionsQuery();
	},
	
	checkForInactiveInstalledApp: function(appInfo) {
		var apps = [];
		var inActiveAppSysIdMap = this._addInactiveInstalledApps(apps, appInfo.shared_internally);
		if (inActiveAppSysIdMap[appInfo.sys_id]) {
			appInfo.is_uninstalled_with_retain_data = true;
		}
	},
	
	getAppInfoFromInstance: function(sourceAppId, appRecord, hideUpgradeInfo) {
        if (!sourceAppId)
            throw "AppsData.getAppInfoFromInstance(): Invalid sourceAppId:" + sourceAppId;
        if (!appRecord) appRecord = this.getAppRecord(sourceAppId, false);
        if (!appRecord)
            throw "AppsData.getAppInfoFromInstance(): No app found matching sourceAppId:" + sourceAppId;
        var appInfo = this._getAppDetails(appRecord);
        var tracker = new ProgressTracker().getInProgressInstallationByAppId(sourceAppId);
        appInfo.install_tracker_id = tracker.id;
        if(tracker.id)
	        appInfo.tracker = tracker;
        this.checkForInactiveInstalledApp(appInfo);
        this._addAppVersions(appInfo);
        if (!hideUpgradeInfo && appInfo.isInstalled) {
            var installationInfo = {};
            appInfo.new_guided_setup_id = this.getNewGuidedSetupId(sourceAppId);
            if (appInfo.contains_plugins || appInfo.contains_plugins == "true") {
                var scopedPluginsInfo = this.getScopedPluginsFromAppId(sourceAppId);
                var listOfScopes = scopedPluginsInfo.listOfScopes;
                var listOfPlugins = scopedPluginsInfo.listOfPlugins;
                appInfo.upgradeHistoryId = new sn_appclient.AppUpgrader().getLatestUpgradeHistoryList(listOfPlugins).toString();
                appInfo.upgradeDetailsInfo = this.getUpgradeInfo(appInfo.upgradeHistoryId);
                installationInfo.installation_log = this.getInstallationInfo(appInfo.scope);
                installationInfo.installed_files = this.getInstalledFilesQuery(listOfScopes);
                installationInfo.customized_files = this.getCustomizedFiles(sourceAppId);
            } else {
                appInfo.upgradeHistoryId = new sn_appclient.AppUpgrader().getLatestUpgradeHistory(appInfo.scope);
                appInfo.upgradeDetailsInfo = this.getUpgradeInfo(appInfo.upgradeHistoryId);
                installationInfo.installation_log = this.getInstallationInfo(appInfo.scope);
                installationInfo.installed_files = this.getInstalledFilesQuery([sourceAppId]);
                installationInfo.customized_files = this.getCustomizedFiles(sourceAppId);
            }
            appInfo.installationInfo = installationInfo;
            appInfo.installedFilesQuery = installationInfo.installed_files;
            appInfo.customizedFilesQuery = installationInfo.customized_files;

        }
        appInfo.userDateFormat = gs.getDateFormat();
        var suiteData = this.fetchSuiteConfigsByAppScope(appInfo.scope, appInfo.versions, appInfo.version);
        if (suiteData && Object.keys(suiteData).length > 0) {
          appInfo.suiteData = suiteData;
          appInfo.isInstalledAndUpdateAvailable = appInfo.isInstalled && appInfo.can_install_or_upgrade && this.checkSuiteUpdateAvailable(appInfo, suiteData, appInfo.version);
        }
        return appInfo;
    },

	// Checks whether the parent app OR any sibling app in compatible suite(s) has an update available.
	checkSuiteUpdateAvailable: function(parentAppInfo, suiteData, installedAppVersion) {
		if (!suiteData || !Array.isArray(suiteData.suiteVersions)) {
			return false;
		}

		if (this.isHigherCustomizedVersionAvailable(parentAppInfo)) {
			return true;
		}

		for (var i = 0; i < suiteData.suiteVersions.length; i++) {
			var suite = suiteData.suiteVersions[i];

			if (!gs.nil(installedAppVersion) && 
				!gs.nil(suite.appVersion) && 
				this.versionComparator.isUpgrade(installedAppVersion, suite.appVersion)) {
				return true;
			}

			if (suite.siblings && Array.isArray(suite.siblings)) {
				for (var j = 0; j < suite.siblings.length; j++) {
					var sibling = suite.siblings[j];
					if (this.isHigherCustomizedVersionAvailable(sibling)) {
						return true;
					}
					if (!gs.nil(sibling.installedVersion) && 
						!gs.nil(sibling.versionInSuite) && 
						this.versionComparator.isUpgrade(sibling.installedVersion, sibling.versionInSuite)) {
						return true;
					}
				}
			}
		}
		return false;
	},

	isHigherCustomizedVersionAvailable: function(appInfo) {
	    if (appInfo &&
	        appInfo.is_customized_app &&
	        appInfo.can_install_or_upgrade_customization &&
	        appInfo.customized_version_info &&
	        Object.keys(appInfo.customized_version_info).length > 0 &&
	        this.versionComparator.isUpgrade(
	            appInfo.customized_version_info.currently_installed_customization,
	            appInfo.customized_version_info.latest_customized_version)) {
	        return true;
	    }
	    return false;
	},

    // Fetch all suites that the app belongs to
    fetchSuiteConfigsByAppScope: function(appScope, versions, installedVersion) {
          var suiteData = {}, suiteVersions = [];
          var suiteConfigSysId, suiteConfig, isVersionDowngradeForSuite, isSuiteCompatible, isSuiteInstalled, suiteVersion, appVersion, parentAppVersion;
          var installedSuiteVersion = this.getInstalledSuiteVersion();

          var m2m = new GlideRecord('sys_suite_config_app_version_m2m');
          m2m.addQuery('app_scope', appScope);
          m2m.query();

          while (m2m.next()) {
              appVersion = m2m.getValue('app_version');
              suiteConfigSysId = m2m.getValue('suite_config');
              if (!suiteConfigSysId) {
                  gs.error("fetchSuiteConfigsByAppScope: No suite config found for mapping: {0}", m2m.getValue('sys_id'));
                  continue;
              }

              suiteConfig = m2m.suite_config.getRefRecord();
              if (!suiteConfig.isValidRecord()) {
                  gs.error("fetchSuiteConfigsByAppScope: No suite config record found for mapping: {0}", m2m.getValue('sys_id'));
                  continue;
              }

              isVersionDowngradeForSuite = !gs.nil(installedSuiteVersion) ? this.versionComparator.isDowngrade(installedSuiteVersion, suiteConfig.getValue('version')) : false;
              isSuiteCompatible = suiteConfig.getValue('compatible') === '1';
              isSuiteInstalled = suiteConfig.getValue('installed') === '1';
              parentAppVersion = this.getAppVersionForParentAppInSuite(versions, appVersion, installedVersion);

              if (!isSuiteCompatible || isVersionDowngradeForSuite || gs.nil(parentAppVersion)) {
                  continue;
              }

              suiteVersion = {
                  sysId: suiteConfig.getValue('sys_id'),
                  name: suiteConfig.getValue('name'),
                  version: suiteConfig.getValue('version'),
                  isInstalled: suiteConfig.getValue('installed') === '1',
                  appVersion:  parentAppVersion,
                  siblings: this.fetchSiblings(suiteConfig.getValue('sys_id'), appScope)
              };

              suiteVersions.push(suiteVersion);
          }

          if (suiteVersions.length > 0) {
              this.versionComparator.sortVersions(suiteVersions);
              suiteVersions.reverse();
              suiteData.latestSuiteVersion = suiteVersions[0].version;
              suiteData.suiteVersions = suiteVersions;

              if (!gs.nil(installedSuiteVersion)) {
                  suiteData.installedSuiteVersion = installedSuiteVersion;
              }
          }
          return suiteData;
    },

    // Fetches the currently in use suite version
    getInstalledSuiteVersion: function() {
          var installedSuiteVersion = "";
          var installedSuiteGR = new GlideRecord('sys_suite_config');
          installedSuiteGR.addQuery('installed', true);
          installedSuiteGR.query();

          if (installedSuiteGR.next()) {
              installedSuiteVersion = installedSuiteGR.getValue('version');
          }
          return installedSuiteVersion;
    },

    // get parent app version if it exists on Instance
    getAppVersionForParentAppInSuite: function(versionsJson, versionInSuite, installedVersion) {
    	var appVersion = CommonUtils.getAppVersionType(versionInSuite) === 'SNAPSHOT' ? versionInSuite.split('SNAPSHOT')[0] : versionInSuite;
    	var installedAppVersion = !gs.nil(installedVersion) && CommonUtils.getAppVersionType(installedVersion) === 'SNAPSHOT' ? installedVersion.split('-')[0] + '-' : installedVersion;
    	var versionInJson;
        for (var i = 0; i < versionsJson.length; i++) {
            versionInJson = CommonUtils.getAppVersionType(versionsJson[i].version) === 'SNAPSHOT' ? versionsJson[i].version.split('-')[0] + '-' : versionsJson[i].version;
            if (this.versionComparator.isEqual(versionInJson, appVersion)) {
                return versionsJson[i].version;
            }
        }
        if (!gs.nil(installedAppVersion) && this.versionComparator.isEqual(appVersion, installedAppVersion)) {
            return installedVersion;
        }
        return "";
    },

    // Fetch all siblings for a given suiteConfig
    fetchSiblings: function(suiteSysId, appScope) {
          var siblings = [], siblingScopeInSuite, siblingVersionInSuite, siblingDetails;
          var siblingGR = new GlideRecord('sys_suite_config_app_version_m2m');
          siblingGR.addQuery('suite_config', suiteSysId);
          siblingGR.addQuery('app_scope', '!=', appScope);
          siblingGR.query();

          while (siblingGR.next()) {
              siblingScopeInSuite = siblingGR.getValue('app_scope');
              siblingVersionInSuite = siblingGR.getValue('app_version');

              siblingDetails = this.getSiblingDetails(siblingScopeInSuite, siblingVersionInSuite);
              if (siblingDetails && Object.keys(siblingDetails).length > 0) {
                  siblings.push(siblingDetails);
              }
          }
          return siblings;
	},

    // Fetch details for a sibling app from sys_store_app table
    getSiblingDetails: function(siblingScopeInSuite, siblingVersionInSuite) {
          var siblingDetails = {};
          var siblingAppVersionInSuite = siblingVersionInSuite;
          var storeGR = new GlideRecord('sys_store_app');
          storeGR.addQuery('scope', siblingScopeInSuite);
          storeGR.addQuery('active', true);
          storeGR.query();

          if (storeGR.next()) {
              var installedVersion = storeGR.getValue('version');
              var installedAppVersion = CommonUtils.getAppVersionType(installedVersion) === 'SNAPSHOT' ? installedVersion.split('-')[0] + '-' : installedVersion;
              var siblingAppVersion = siblingVersionInSuite;
              if (CommonUtils.getAppVersionType(siblingVersionInSuite) === 'SNAPSHOT') {
              	siblingAppVersion = siblingVersionInSuite.split('SNAPSHOT')[0];
              	var appVersionGR = new GlideRecord('sys_app_version');
              	appVersionGR.addQuery('scope', siblingScopeInSuite);
              	appVersionGR.addQuery('version', 'STARTSWITH', siblingAppVersion);
              	appVersionGR.query();
              	if (appVersionGR.next()) {
              		siblingAppVersionInSuite = appVersionGR.getValue('version');
              	} else if (this.versionComparator.isEqual(installedAppVersion, siblingAppVersion)) {
              		siblingAppVersionInSuite = installedVersion;
              	}
              }
              var isDowngradedAppVersionInSuite = this.versionComparator.isDowngrade(installedAppVersion, siblingAppVersion);
              var siblingVersion = isDowngradedAppVersionInSuite ? installedVersion: siblingAppVersionInSuite;

              siblingDetails = {
                  sysId: storeGR.getValue('sys_id'),
                  name: storeGR.getValue('name'),
                  scope: storeGR.getValue('scope'),
                  versionInSuite: siblingAppVersionInSuite,
                  installedVersion: installedVersion,
                  versionConflict: isDowngradedAppVersionInSuite,
                  dependencies: storeGR.getValue('dependencies'),
                  storeLink: this._getStoreLink(storeGR.getValue('sys_id'), siblingVersion),
                  is_customized_app: sn_app_customization.AppCustomizationAPI.isCustomizedAppOnAllAppsPage(storeGR.getValue('sys_id')),
                  can_install_or_upgrade_customization: sn_app_customization.AppCustomizationAPI.canInstallOrRepairCustomization(storeGR.getValue('sys_id')),
                  customized_version_info: this._getCustomizedVersionInfo(storeGR),
                  contains_unpublished_customizations: sn_app_customization.AppCustomizationAPI.containsUnpublishedCustomizations(storeGR.getValue('sys_id'))
            };
          }
          return siblingDetails;
    },

    _getCustomizedVersionInfo: function(storeGR) {
		var sysId = storeGR.getValue('sys_id');
		var customizationInfo = sn_app_customization.AppCustomizationAPI.getCustomizationVersionInfo(sysId);

		if (storeGR.shared_internally == false) {
			customizationInfo.latest_customized_version =
				this._getLatestCustomizedVersion(customizationInfo.customization_versions) ||
				customizationInfo.customized_version_default;
		}

		return customizationInfo;
	},

    getScopedPluginsFromAppId: function(appID) {
        var gr = new GlideRecord('sys_scoped_plugin');
        gr.addQuery('parent_scope_id', appID);
        gr.query();
        var listOfScopes = [];
        var listOfPlugins = [];
        while (gr.next()) {
            if (listOfScopes.indexOf(gr.getValue('scope')) == -1)
                listOfScopes.push(gr.getValue('scope'));
            if (listOfPlugins.indexOf(gr.getValue('source')) == -1)
                listOfPlugins.push(gr.getValue('source'));
        }
        return {
            "listOfScopes": listOfScopes,
            "listOfPlugins": listOfPlugins
        };
    },	
	getNewGuidedSetupId: function(id) {
		if(gs.nil(id)) return null;

		var gr = new GlideRecord("help_guidance");
		gr.addQuery('sys_scope', id).addOrCondition('sys_package', id);
		gr.addQuery("type", "global_setup");
		gr.addQuery("status", "published");
		gr.query();
		if (gr.next()) {
			return gr.getUniqueValue();
		}
		return null;
	},
    getInstallationInfo: function(pluginId, pluginOrID){
    	var sysPluginLog = new GlideRecord("sys_plugin_log");
    	var qc = sysPluginLog.addQuery("plugin", pluginId);
    	if(pluginOrID)
    		qc.addOrCondition("plugin", pluginOrID);
    	sysPluginLog.query();
    	return {"count": sysPluginLog.getRowCount(), "query": sysPluginLog.getEncodedQuery()};
    },
    getUpgradeInfo: function(upgradeHistoryIds) {
        var upgradeInfo = {};
        var pluginsData = new global.PluginsData();
        upgradeInfo.changes_skipped = pluginsData.getUpgradeHistoryInfo("dispositionIN4,104,9,10^changed=true^ORdisposition=9^resolution_status=not_reviewed^ORresolution_status=^upgrade_history.sys_idIN" + upgradeHistoryIds);
        upgradeInfo.changes_applied = pluginsData.getUpgradeHistoryInfo('dispositionIN1,2,3,101,102,103^changed=true^upgrade_history.sys_idIN' + upgradeHistoryIds);
        upgradeInfo.changes_processed = pluginsData.getUpgradeHistoryInfo('dispositionIN4,5,104,105,9,10^changed=true^ORdispositionIN9,5,105^resolution_status!=not_reviewed^resolution_status!=^upgrade_history.sys_idIN' + upgradeHistoryIds);
        upgradeInfo.copies_to_review = pluginsData.getUpgradeHistoryInfo('dispositionIN201,202,203^resolution_status=not_reviewed^ORresolution_status=^upgrade_history.sys_idIN' + upgradeHistoryIds);
        upgradeInfo.customized_unchanged = pluginsData.getUpgradeHistoryInfo('dispositionIN4,104^changed=false^upgrade_history.sys_idIN' + upgradeHistoryIds);
        upgradeInfo.upgrade_details = pluginsData.getUpgradeHistoryInfo('upgrade_history.sys_idIN' + upgradeHistoryIds);
        return upgradeInfo;
    },
	getInstalledFilesQuery: function(appIDs) {
		var fileNames = new global.UpdateVersionAPI().getCustomerFileNames(appIDs);
		var grCustomerFiles = new GlideRecord("sys_metadata");
		grCustomerFiles.addQuery("sys_scope", "IN", appIDs);
		grCustomerFiles.addQuery("sys_update_name", "IN", fileNames);
		grCustomerFiles.query();
		var sysIDs = [];
		while(grCustomerFiles.next()) {
			sysIDs.push(grCustomerFiles.sys_id.toString());
		}

		var grNonCustomerFiles = new GlideRecord("sys_metadata");
		grNonCustomerFiles.addQuery("sys_scope", "IN", appIDs);
		grNonCustomerFiles.addQuery("sys_id", "NOT IN", sysIDs);
		grNonCustomerFiles.query();
		
		return {
            "count": grNonCustomerFiles.getRowCount(),
            "query": this.pluginData.getTinyURL(Constants.INSTALLED_FILES + grNonCustomerFiles.getEncodedQuery())
        };
    },
    getCustomizedFiles: function(appID) {
        var customizedFiles = new GlideRecord("sys_metadata_customization");
        customizedFiles.addQuery("sys_metadata.sys_scope", appID);
        customizedFiles.query();
        return {
            "count": customizedFiles.getRowCount(),
            "query": this.pluginData.getTinyURL(Constants.CUSTOMIZED_FILES + customizedFiles.getEncodedQuery())
        };
    },

    isStoreSyncCompleted: function(trackerId) {
        var pt = new ProgressTracker();
        var response = {
            isComplete: pt.isComplete(trackerId),
            appsSyncProgress: gs.getProperty("sn_appclient.apps_sync_progress", 0),
        };
        if (response.isComplete) {
            response.repoTime = pt.getExecutionTime(trackerId) || 0;
            response.errorMessage = new AppsData().getLatestErrorMessage("get_all_available_apps") || "";
            var lastSyncTime = CommonUtils.getSystemProperty("sn_appclient.apps_last_sync_time", "value");
            var glideDateTime = lastSyncTime ? new GlideDateTime(lastSyncTime) : "";
            response.appsLastSyncTime = glideDateTime ? glideDateTime.getDisplayValueLang("medium") : "";
            var collectionData = {};
            collectionData.type = "store_updates_time";
            collectionData.time = (response.repoTime.storeUpdatesTime / 1000).toFixed(2);
            new AppClientGCFUtil().recordPageLoadAnalytics(collectionData);

            if (response.repoTime.pluginUpdatesTime) {
                collectionData.type = "plugin_updates_time";
                collectionData.time = (response.repoTime.pluginUpdatesTime / 1000).toFixed(2);
                new AppClientGCFUtil().recordPageLoadAnalytics(collectionData);
            }
        }
        response.userDateFormat = gs.getDateFormat();
        return response;
    },

    processSyncAppsRequest: function(args) {
        var queryParams = args.queryParams;
        var requestType = queryParams.request_type;
        var trackerId = queryParams.tracker_id;
        switch (requestType) {
            case 'trigger_apps_sync':
                return {
                    trackerId: this.checkUpdatesFromStore(false, {
                        appManagerCacheEnabled: false,
                        honourChecksum: false,
                        isInteractive: false
                    })
                };
            case 'get_apps_sync_status':
                if (!trackerId) {
                    throw new Error("Missing parameters: tracker_id");
                }
                return this.isStoreSyncCompleted(trackerId);
            default:
                throw new Error("Unknown request type");
        }
    },

	type: 'AppsData'
};
