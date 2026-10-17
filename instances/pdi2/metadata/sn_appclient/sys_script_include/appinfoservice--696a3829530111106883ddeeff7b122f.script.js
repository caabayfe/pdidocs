var AppInfoService = Class.create();
AppInfoService.prototype = {
    initialize: function() {
        this.appsData = new AppsData();
    },
    getInstanceAppInfo: function(args) {
        if (!args.pathParams.appID)
            throw "AppInfoService:getInstanceAppInfo Path Param appId is missing";
        var appDetails = {};
        this.startTime = new GlideDateTime().getNumericValue();
        appDetails.app_info_on_instance = this.appsData.getAppInfoFromInstance(args.pathParams.appID);
        appDetails.time_taken = new GlideDateTime().getNumericValue() - this.startTime;
        return appDetails;
    },
    getAppInfoFromStore: function(args) {
        if (!args.pathParams.sourceAppId || !args.pathParams.version)
            throw "AppInfoService.getAppInfoFromStore():  Missing mandatory path params";

        if (this.appsData.isInstanceOffline()) {
            return this.getOOBAppInfo(args);
        }
        var apiRequestArgs = {
            apiName: "instance_api",
            params: {
                "sub_type": "get_app_details_from_store",
                "app_id": args.pathParams.sourceAppId,
                "version": args.pathParams.version
            },
            method: "Get"
        };

        var appInfo = AppManagerIntegrationAPI.makeAPIRequest(apiRequestArgs);
        return appInfo;
    },
    getOOBAppInfo: function(args) {
        return {}
    },

	getAppsCountForBadges: function(args, tableName, addOptionalAppsFlag){
		if(addOptionalAppsFlag){
			args.encodedQuery += "^optional_apps_available=true";
		}
		var count = AppsDAO.getApps(args,tableName, []).count;
		return count;
	},

    getApps: function(appManagerAPIUtil) {
        var bodyObj = appManagerAPIUtil.getRequestBody();
        var args = appManagerAPIUtil.getPaginationParams() || {};
        args.requirePagination = Object.keys(args).length > 0;
        var tabContext = appManagerAPIUtil.params.queryParams[Constants.TAB_CONTEXT];
        var sortBy = appManagerAPIUtil.params.queryParams[Constants.SORT_BY_PARAM];
        if (!tabContext)
            throw "AppInfoService.getApps(): Missing mandatory query parameter " + Constants.TAB_CONTEXT;
        args[Constants.TAB_CONTEXT] = tabContext;
        args[Constants.SORT_BY_PARAM] = sortBy;
        args.searchTerm = appManagerAPIUtil.getSearchTerm();
        args.filterParams = bodyObj;
        args.encodedQuery = this._getEncodedQueryBySearchContext(args);
        var rowMapper = AppsDAO.appMapper;
        var response = {};
        switch (tabContext) {
            case "available_for_you":
                gs.eventQueue("sn_appclient.update_last_installed_from"); // update last installed from on sys_store_app table to decide source of installation of the app and keep it ready for installed tab
                response = AppsDAO.getApps(args, Constants.TABLE_SYS_REMOTE_APP, rowMapper);
                args.encodedQuery += "^active=false";
                var partialInstallAppsResponse = AppsDAO.getApps(args, Constants.TABLE_SYS_STORE_APP, rowMapper);
                var mergedApps = response.apps.concat(partialInstallAppsResponse.apps);
                mergedApps = mergedApps.filter(function(app, index, self) {
                    return index === self.findIndex(function(a) {
                        return a.sys_id === app.sys_id;
                    });
                });
                response.apps = mergedApps;
                response.count += partialInstallAppsResponse.count;
                if (!args.searchTerm)
                    break;

                response.avl_for_you_badge_count = response.count;
                args[Constants.TAB_CONTEXT] = "installed";
                args.encodedQuery = this._getEncodedQueryBySearchContext(args);
                response.installed_badge_count = this.getAppsCountForBadges(args, Constants.TABLE_SYS_STORE_APP, false);
                args[Constants.TAB_CONTEXT] = "updates";
                args.encodedQuery = this._getEncodedQueryBySearchContext(args);
                response.updates_badge_count = this.getAppsCountForBadges(args, Constants.TABLE_SYS_STORE_APP, false);
                break;
            case "installed":
                response = AppsDAO.getApps(args, Constants.TABLE_SYS_STORE_APP, rowMapper);
                this.addCustomizationInfo(response.apps);
                if (!args.searchTerm)
                    break;

                response.installed_badge_count = response.count;
                args[Constants.TAB_CONTEXT] = "available_for_you";
                args.encodedQuery = this._getEncodedQueryBySearchContext(args);
                response.avl_for_you_badge_count = this.getAppsCountForBadges(args, Constants.TABLE_SYS_REMOTE_APP, false);
                response.avl_for_you_badge_count += this.getAppsCountForBadges(args, Constants.TABLE_SYS_STORE_APP, true);
                args[Constants.TAB_CONTEXT] = "updates";
                args.encodedQuery = this._getEncodedQueryBySearchContext(args);
                response.updates_badge_count = this.getAppsCountForBadges(args, Constants.TABLE_SYS_STORE_APP, false);
                break;
            case "updates":
                response = AppsDAO.getApps(args, Constants.TABLE_SYS_STORE_APP, rowMapper);
                this.addCustomizationInfo(response.apps);
                if (!args.searchTerm)
                    break;

                response.updates_badge_count = response.count;
                args[Constants.TAB_CONTEXT] = "available_for_you";
                args.encodedQuery = this._getEncodedQueryBySearchContext(args);
                response.avl_for_you_badge_count = this.getAppsCountForBadges(args, Constants.TABLE_SYS_REMOTE_APP, false);
                response.avl_for_you_badge_count += this.getAppsCountForBadges(args, Constants.TABLE_SYS_STORE_APP, true);

                args[Constants.TAB_CONTEXT] = "installed";
                args.encodedQuery = this._getEncodedQueryBySearchContext(args);
                response.installed_badge_count = this.getAppsCountForBadges(args, Constants.TABLE_SYS_STORE_APP, false);
                break;
        }
        appManagerAPIUtil.addTotalCountHeader(response.count);
        appManagerAPIUtil.setHeader("avl_for_you_badge_count", response.avl_for_you_badge_count);
        appManagerAPIUtil.setHeader("installed_badge_count", response.installed_badge_count);
        appManagerAPIUtil.setHeader("updates_badge_count", response.updates_badge_count);
        delete response.count;
        delete response.avl_for_you_badge_count;
        delete response.installed_badge_count;
        delete response.updates_badge_count;
        return response;
    },
    _getEncodedQueryBySearchContext: function(args) {
        var encodedQuery = "shared_internally=" + !!args.sharedInternally;
        if (args[Constants.TAB_CONTEXT] == 'updates' || args[Constants.TAB_CONTEXT] == 'installed')
            encodedQuery += "^ORshared_internallyISEMPTY^active=true^last_installed_fromINstore,out_of_band,offline";
        if (args[Constants.TAB_CONTEXT] == 'updates')
            encodedQuery += "^update_available=true";
        if (args.searchTerm)
            encodedQuery += "^GOTO123TEXTQUERY321=" + args.searchTerm;
        if (args.filterParams && Object.keys(args.filterParams).length > 0)
            encodedQuery = this._appendEncodedQueryByFilterParams(encodedQuery, args.filterParams);
        if (!gs.getUser().hasRole("maint")) {
            encodedQuery += "^hide_on_ui=false";
            if (args[Constants.TAB_CONTEXT] == 'updates' || args[Constants.TAB_CONTEXT] == 'installed') {
                encodedQuery += "^ORcustomization!=NULL";
            }
        }
        return encodedQuery;
    },
    _appendEncodedQueryByFilterParams: function(encodedQuery, filterParams) {
        var processedFilters = [];
        var i;

        var LOBs = [];
        var productFamily = [];
        var adoptionBluePrint = [];
        var offeredBy = [];
        var listings = [];
        var priceType = [];
        var myApps = [];
        if (filterParams.hasOwnProperty('productFamily'))
            LOBs = filterParams['productFamily'];
        if (filterParams.hasOwnProperty('productFamily'))
            productFamily = filterParams['productFamily'];
        if (filterParams.hasOwnProperty('offeredBy'))
            offeredBy = filterParams['offeredBy'];
        if (filterParams.hasOwnProperty('adoptionBlueprint'))
            adoptionBluePrint = filterParams['adoptionBlueprint'];
        if (filterParams.hasOwnProperty('listings'))
            listings = filterParams['listings'];
        if (filterParams.hasOwnProperty('priceType'))
            priceType = filterParams['priceType'];
        if (filterParams.hasOwnProperty('myApps'))
            myApps = filterParams['myApps'];

        var isfreeToTryPresent = listings.indexOf('free_to_try') != -1;
        if (isfreeToTryPresent) {
            encodedQuery += "^indicatorsLIKEfree_to_try";
        }
        if (offeredBy != null && offeredBy.length == 1)
            if (offeredBy[0] === 'partners')
                encodedQuery += "^vendor!=" + 'servicenow';
            else
                encodedQuery += "^vendor=" + offeredBy[0];

        if (priceType.length > 0) {
          var showFree = priceType.includes('free');
          var showPaid = priceType.includes('paid');
          if (showFree && showPaid) {
            // both is the same as neither
          } else if (showFree) {
            encodedQuery += '^price_type=free';
          } else if (showPaid) {
            encodedQuery += '^price_type=paid';
          }
        }

        if (myApps.length > 0) {
          if (myApps.includes('licensed')) {
            encodedQuery += '^indicatorsNOT LIKE"id":"not_licensed"^indicatorsNOT LIKE"id":"not_purchased"';
          }
          if (myApps.includes('compatible')) {
            encodedQuery += '^indicatorsNOT LIKE"id":"incompatible"';
          }
          if (myApps.includes('upcomingrenewal')) {
            encodedQuery += '^indicatorsLIKE"id":"purchase_contract_expiring"';
          }
          if (myApps.includes('trialstarted')) {
            encodedQuery += '^indicatorsLIKE"id":"trial_started"';
          }
        }

        if (LOBs != null && LOBs.length > 0)
            for (i = 0; i < LOBs.length; i++) {
                if (i > 0) encodedQuery += "^OR";
                else encodedQuery += "^";
                encodedQuery += "lobLIKE" + LOBs[i];
            }
        if (productFamily != null && productFamily.length > 0)
            for (i = 0; i < productFamily.length; i++) {
                if (i > 0 || (LOBs && LOBs.length > 0)) encodedQuery += "^OR";
                else encodedQuery += "^";
                encodedQuery += "productsLIKE" + productFamily[i];
            }
        if (adoptionBluePrint != null && adoptionBluePrint.length > 0) {
            adoptionBluePrintQuery = this.getEncodedQueryByAdoptionBluePrint(adoptionBluePrint);
            appNames = new AppManagerFiltersUtil().getFilteredIdsWithAdoptionBluePrint(adoptionBluePrintQuery);
            if (appNames != null && appNames.length > 0)
                for (i = 0; i < appNames.length; i++) {
                    if (i > 0) encodedQuery += "^OR";
                    else encodedQuery += "^";
                    encodedQuery += "name=" + appNames[i];
                }
        }
        return encodedQuery;
    },
    getEncodedQueryByAdoptionBluePrint: function(adoptionBluePrint) {
        var adoptionBluePrintQuery = "";
        for (var i = 0; i < adoptionBluePrint.length; i++) {
            if (i > 0) adoptionBluePrintQuery += "^OR";
            adoptionBluePrintQuery += "objective.sys_id=" + adoptionBluePrint[i];
        }
        return adoptionBluePrintQuery;
    },
    addCustomizationInfo: function(apps) {
        for (var appIndex in apps) {
            if (apps[appIndex].customization)
                apps[appIndex].customized_version_info = sn_app_customization.AppCustomizationAPI.getCustomizationVersionInfo(apps[appIndex].sys_id);
        }
    },

    type: 'AppInfoService'
};
