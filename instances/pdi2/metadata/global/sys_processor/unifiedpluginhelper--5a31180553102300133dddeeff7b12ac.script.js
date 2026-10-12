(function process(g_request, g_response, g_processor) {
	var method = (g_request.getParameter("method") || '').toLowerCase() + '';

	switch (method) {
		case "get_all_filters":
			getAllFilters();
			break;
		case "get_plugins":
			getPlugins();
			break;
		case "get_notification_config":
			getNotificationConfig();
			break;
		case "is_upgrade_system_busy":
			isUpgradeSystemBusy();
			break;
		default:
			g_response.setStatus(400);
			gs.error("Unknown method: " + method);
	}
	
	function getNotificationConfig() {
		var filterCategoryLabelMap = {
			"Indicators": gs.getMessage("Indicators"),
			"Obtained": gs.getMessage("Obtained"),
			"License Status": gs.getMessage("License Status"),
			"Listing type": gs.getMessage("Listing type")
		};

		var notificationConfig = [
			{
				id: "deactivation_request", 
				name: gs.getMessage("App deactivation requests"), 
				assertion: "app.all_indicators && app.all_indicators.trial_deactivation_requested",
				filter: filterCategoryLabelMap["Indicators"] + "=trial_deactivation_requested^" + filterCategoryLabelMap["Listing type"] + "=show_apps_only"
			},
			{
				id: "installation_available", 
				name: gs.getMessage("Apps available for install"), 
				assertion: "app.isInstalled === false && !app.isPlugin",
				filter: filterCategoryLabelMap["Obtained"] + "=not_installed^" + filterCategoryLabelMap["License Status"] + "=sub^" + filterCategoryLabelMap["Listing type"] + "=show_apps_only"
			},
			{
				id: "updates_available", 
				name: gs.getMessage("App updates"), 
				assertion: "app.version && app.active && app.latest_version != app.version && app.can_install_or_upgrade && app.isInstalledAndUpdateAvailable",
				filter: filterCategoryLabelMap["Obtained"] + "=updates^" + filterCategoryLabelMap["Listing type"] + "=show_apps_only"
			},
			{
				id: "entitlement_revoked", 
				name: gs.getMessage("Apps with entitlement revoked"), 
				assertion: "app.all_indicators && app.all_indicators.entitlement_revoked",
				filter: filterCategoryLabelMap["Obtained"] + "=entitlement_revoked"
			}
		];
		
		var encodedResponse = new global.JSON().encode(notificationConfig);
		g_processor.writeOutput("application/json", encodedResponse);
		g_response.setStatus(200);
	}
	
	function getAllFilters() {
		var allFilters = [];

		// all assertions must refer fields of "app"
		if (gs.getProperty("sn_appclient.group.apps.by.products", "true") == 'true')
			allFilters.push({
				name: gs.getMessage("Listing type"),
				filters: [
					{
						lob_id: "show_apps_only",
						lob_name: gs.getMessage("Applications"),
						assertion: "NA"
					},
					{
						lob_id: "show_products_only",
						lob_name: gs.getMessage("ServiceNow Products"),
						assertion: "NA"
					}
				]
			});

		allFilters.push({
			name: gs.getMessage("Obtained"),
			filters: [
				{
					lob_id: "installed",
					lob_name: gs.getMessage("Installed"),
					assertion: "app.isInstalled === true"
				},
				{
					lob_id: "not_installed",
					lob_name: gs.getMessage("Not Installed"),
					assertion: "app.isInstalled === false"
				},
				{
					lob_id: "updates",
					lob_name: gs.getMessage("Updates"),
					assertion: "app.version && app.active &&  app.can_install_or_upgrade && (app.isInstalledAndUpdateAvailable || app.isCustomizationUpdateAvailable)"
				},
				{
				  lob_id: "customized",
				  lob_name: gs.getMessage("Customized"),
				  assertion: "app.is_customized_app === true"
				},
				{
				  lob_id: "installation_scheduled",
				  lob_name: gs.getMessage("Installation Scheduled"),
				  assertion: "app.isScheduled === true"
				}
			]
		});

		var lobCategories = new global.JSON().decode(SNC.UAAppInfo.getLOBCategories());

		lobCategories.forEach(function(a){
			a.assertion = "app.all_lobs.indexOf('" + a.lob_id + "') > -1";
		});

		allFilters.push({
			name: gs.getMessage("Price"),
			filters:[
				{
					lob_id: "free",
					lob_name: sn_i18n.Message.getMessage("glide_plugin_price", "Free{? used as a Price - Free or Paid}"),
					assertion: "app.free == true"
				},
				{
					lob_id: "paid",
					lob_name: gs.getMessage("Paid"),
					assertion: "app.paid == true"
				}
			]
		});

		allFilters.push({
			name: gs.getMessage("License Status"),
			filters: [
				{
					lob_id: "sub_not_required",
					lob_name: gs.getMessage("Subscription not required"),
					assertion: "app.license_check_required == '0' || ((app.isPlugin || !app.isAppstorePlugin) && app.license_check_required !== '1' && app.entitled !== 'yes')"
				},
				{
					lob_id: "sub",
					lob_name: gs.getMessage("Subscribed"),
					assertion: GlideUtil.isOpenInstance() ? "!app.isPlugin && app.isAppstorePlugin" : "((app.isPlugin || !app.isAppstorePlugin) && app.license_check_required == '1' && app.entitled == 'yes') || (!app.isPlugin && app.isAppstorePlugin)"
				},
				{
					lob_id: GlideUtil.isOpenInstance() ? "sub_unknown" : "sub_required",
					lob_name: GlideUtil.isOpenInstance() ? gs.getMessage("Subscription unknown") : gs.getMessage("Subscription required"),
					assertion: GlideUtil.isOpenInstance() ? "app.license_check_required == '1'" : "app.license_check_required == '1' && app.entitled != 'yes'"
				}
			]
		});

		allFilters.push({
			name: gs.getMessage("Product family"),
			is_product_family: true,
			filters: lobCategories
		});

		g_processor.writeOutput("application/json", new global.JSON().encode(allFilters));
		g_response.setStatus(200);
	}
	
	
	/*Try to access the UA for accessing plugins, 
	if we get a failure, catch will return an empty array for plugin from the API
	*/
	function getPlugins() {
		var isFirstLoad = g_request.getParameter("isFirstLoad") == "true";
		var plugins = new PluginsData().getpluginsdata(isFirstLoad, g_request.getParameter("isFirstLoad") == null);
		
		var decodedResp = new global.JSON().encode(plugins);
		
		g_processor.writeOutput("application/json", decodedResp);
		g_response.setStatus(200);
	}
	
	function isUpgradeSystemBusy() {
		var response = {};
		var systemState = new PluginActivationVisible().isInstallationAllowed();
		response.isSystemAvailable = systemState.installationAllowed;
		if(!response.isSystemAvailable)
		    response.systemBusyMessage = systemState.message;
		g_processor.writeOutput("application/json", new global.JSON().encode(response));
		g_response.setStatus(200);
	}

    function generateIndicatorObjectList(indicatorKeys) {
        var indicatorKeyMessageMap = {
            "unsupported_environment": gs.getMessage("Unsupported Environment"),
        };

        var indicatorObjList = [];
        var parsedKeys = JSON.parse(indicatorKeys || '[]');
        parsedKeys.forEach(function(key, index) {
            indicatorObjList[index] = {
                id: key,
                message: indicatorKeyMessageMap[key]
            };
        });

        return indicatorObjList;
    }

})(g_request, g_response, g_processor);
