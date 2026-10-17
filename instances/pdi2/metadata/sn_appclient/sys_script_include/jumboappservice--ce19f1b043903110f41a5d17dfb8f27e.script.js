var JumboAppService = Class.create();
JumboAppService.prototype = {

    initialize: function(isInstanceOffline, jumboCatalog) {
        this.isInstanceOffline = isInstanceOffline;
        this.versionComparator = new VersionComparator();
        this.chunkSize = gs.getProperty("sn_appclient.get_app_metadata_limit", 50);
        this.chunkIndex = 0;
        this.index = 0;
        this.jumboCatalog = jumboCatalog;
        this.pluginData = new global.PluginsData();
    },

    createRemoteScopedPlugin: function(appPackageInfo) {
        if (appPackageInfo.type == 'hosted')
            return; // Do not process hosted plugins as they will not be representing their own plugin object.

        var hiddenOnUI = appPackageInfo.type == 'implementation_detail' ? true : false;
        var containsPlugin = appPackageInfo.hasOwnProperty("anchor") && (appPackageInfo.anchor == 'true' || appPackageInfo.anchor == true);
        var isUpdate = false;
        var gr = new GlideRecord("sys_scoped_plugin");
        gr.addQuery("active", true);
        gr.addQuery("source", appPackageInfo.id);
        gr.addQuery("version", appPackageInfo.version);
        gr.query();
        if (gr.next()) {
            this.pluginData.updateJumboPlugin(gr, appPackageInfo);
		}
        gr = new GlideRecord("sys_remote_scoped_plugin");
        gr.addQuery("source", appPackageInfo.id);
        gr.addQuery("version", appPackageInfo.version);
        gr.query();
        if (gr.next())
            isUpdate = true;
        else
            gr = new GlideRecord("sys_remote_scoped_plugin");
        gr.setValue("block_install", false);
        gr.setValue("block_message", "");
        gr.setValue("conditional_dependencies", (appPackageInfo.dependencies.conditional || []).toString());
        gr.setValue("contains_plugins", containsPlugin);
        gr.setValue("custom_table_count", appPackageInfo.custom_table_count || 0);
        gr.setValue("demo_data", appPackageInfo.has_demo_data || false);
        gr.setValue("name", appPackageInfo.name);
        gr.setValue("dependability", appPackageInfo.dependability || 'closed');
        gr.setValue("enforce_license", appPackageInfo.enforce_license);
        gr.setValue("hard_dependencies", (appPackageInfo.dependencies.hard || []).toString());
        gr.setValue("hide_on_ui", hiddenOnUI);
        gr.setValue("licensable", appPackageInfo.licensable || false);
        gr.setValue("logo", "");
        gr.setValue("source", appPackageInfo.id);
        gr.setValue("needs_app_engine_licensing", appPackageInfo.needs_app_engine_licensing || false);
        gr.setValue("optional_dependencies", (appPackageInfo.dependencies.optional || []).toString());
        gr.setValue("path", appPackageInfo.path);
        gr.setValue("price_type", appPackageInfo.price_type);
        gr.setValue("scope", appPackageInfo.scope.name);
        gr.setValue("source_app_name", appPackageInfo.source_app_name);
        gr.setValue("scope_sys_id", appPackageInfo.scope.id);
        gr.setValue("screened_dependents", (appPackageInfo.screened || []).toString());
        gr.setValue("description", appPackageInfo.description || "");
        gr.setValue("soft_dependencies", (appPackageInfo.dependencies.soft || []).toString());
        gr.setValue("source_app_id", appPackageInfo.source_app_id);
        gr.setValue("type", appPackageInfo.type);
        gr.setValue("uninstall_blocked", appPackageInfo.uninstall_blocked || (appPackageInfo.hasOwnProperty('mode') && (appPackageInfo.mode == 'core' || appPackageInfo.mode == 'boot')) || false);
        gr.setValue("version", appPackageInfo.version);
        gr.setValue("scope_owner", appPackageInfo.scope_owner);
	gr.setValue("parent_plugin", appPackageInfo.parent_plugin);
	if (appPackageInfo.anchor == 'true' || appPackageInfo.anchor == true)
	    gr.setValue("hosted_plugins", appPackageInfo.hosted_plugins);
        isUpdate ? gr.update() : gr.insert();
    },

    updateAppInfoWithAppsInJumbo: function( /*GlideRecord sys_remote_app or sys_store_app */ appInfo, /*Comma separated jumbo component info */ appsInJumboJSON) {
        if (appInfo == null) return;
        gs.debug("JumboAppService.updateAppInfoWithAppsInJumbo for sourceAppId:{0} is {1}", appInfo.getValue("sys_id"), JSON.stringify(appsInJumboJSON));
        appInfo.setValue("apps_in_jumbo", JSON.stringify(appsInJumboJSON));
        appInfo.update();
    },

    isJumboInstalled: function( /*GlideRecord sys_store or sys_remote_app*/ app) {
        return (app.getRecordClassName() == "sys_store_app") ? true : false;
    },

    processChunk: function() {
        var appsJSON = this.getJumboAppInfo();
        var updateChecker = new sn_appclient.UpdateChecker();
        gs.debug("processChunk appJSON info: " + JSON.stringify(appsJSON));
        for (var jumboSourceAppId in appsJSON) {
            var appsJson = appsJSON[jumboSourceAppId];
            gs.debug("appsJson: " + JSON.stringify(appsJson));
            var appInfo = updateChecker._getApp(jumboSourceAppId);
            var isJumboInstalled = this.isJumboInstalled(appInfo);
            var appsInJumboJSON = JSON.parse(appInfo.getValue("apps_in_jumbo") || "[]");
            var appsInJumboJSON = [];

            for (var i in appsJson) {
                //Not populating the tables as it should be already there prior installation as its installed.
                if (isJumboInstalled && !this.versionComparator.isUpgrade(appInfo.getValue("version"), appsJson[i].version) && !appsJson[i].version.includes(("-SNAPSHOT")))
                    continue;
                var appPackages = appsJson[i].app_packages;
                for (var j in appPackages) {
                    //hosted plugins need not be processed here
                    if (appPackages[j].type == 'hosted')
                        continue;
                    appPackages[j].version = appsJson[i].version;
                    appPackages[j].source_app_id = jumboSourceAppId;
                    appPackages[j].source_app_name = appsJson[i].scope_name;
                    appPackages[j].parent_plugin = appsJson[i].plugin_id;;
                    appPackages[j].hosted_plugins = appsJson[i].hosted_plugins;;
                    var jumboPluginInfo = appPackages[j].name + "," + appPackages[j].id + "," + appPackages[j].scope.name;
                    if(appsInJumboJSON.indexOf(jumboPluginInfo) == -1)
                        appsInJumboJSON.push(jumboPluginInfo);
                    this.createRemoteScopedPlugin(appPackages[j]);
                }
            }
            this.updateAppInfoWithAppsInJumbo(appInfo, appsInJumboJSON);
        }

    },


    populateJumboTables: function() {
        gs.debug("JumboAppService.populateJumboTables() ----- START");
        if (this.jumboCatalog && this.jumboCatalog.length == 0)
            return;
        while (this.hasMoreChunks()) {
            this.processChunk();
        }
        gs.debug("JumboAppService.populateJumboTables() ----- END");
    },

    getJumboAppInfo: function() {
        if (this.isInstanceOffline)
            return this.getOfflineJumboAppInfo();
        return this.getStoreJumboAppInfo();
    },

    //Method to get app.json info for jumbo apps
    getOfflineJumboAppInfo: function() {
        if (!this.hasMoreChunks())
            return;
        var jsonMap = {};
        var jumboCatalog = this.getChunk();
        var attachmentReader = new global.AttachmentReader();
        for (var catlogIndex in jumboCatalog) {
            var jumboSourceAppId = jumboCatalog[catlogIndex].source_app_id;
            jsonMap[jumboSourceAppId] = [];
            var sysIds = [];
            var offlineAppGR = new GlideRecord("sys_offline_app");
            offlineAppGR.addEncodedQuery(this.getEncodedQuery(jumboCatalog[catlogIndex]));
            offlineAppGR.query();
            while (offlineAppGR.next())
                sysIds.push(offlineAppGR.getValue("sys_id"));

            var encodedQuery = "file_name=app.json^table_sys_id=" + sysIds.join("^ORtable_sys_id=");
            var attachmentGR = new GlideRecord("sys_attachment");
            attachmentGR.addEncodedQuery(encodedQuery);
            attachmentGR.query();
            while (attachmentGR.next()) {
                jsonMap[jumboSourceAppId].push(JSON.parse(attachmentReader.getContent(attachmentGR)));
            }
        }
        gs.debug("getOfflineJumboAppInfo is " + JSON.stringify(jsonMap));
        return jsonMap;
    },

    getEncodedQuery: function(jumboCatalogItem) {
        var versionsQuery = jumboCatalogItem.versions.join("^ORlatest_version=");
        var encodedQuery = "source_app_id=" + jumboCatalogItem.source_app_id + "^latest_version=" + versionsQuery;
        gs.debug("JumboAppService.getEncodedQuery : " + encodedQuery);
        return encodedQuery;
    },

    getChunk: function() {
        var jumboCatalog = this.jumboCatalog;
        var requestData = [];
        var requestSize = 0;
        for (var i = this.index; i < jumboCatalog.length; i++) {
            if ((requestSize + jumboCatalog[i].versions.length) > this.chunkSize)
                break;
            requestSize += jumboCatalog[i].versions.length;
            requestData.push(jumboCatalog[i]);
            this.index++;
        }
        return requestData;
    },

    hasMoreChunks: function() {
        return this.index < this.jumboCatalog.length;
    },

    getStoreJumboAppInfo: function() {
        var chunk = this.getChunk();
        gs.info("Chunk: {0}", JSON.stringify(chunk));
        var apiArgs = {
            apiName: "get_app_metadata",
            params: {
                "request_data": JSON.stringify(chunk),
                "sysparm_application_source": Constants.APP_MANAGER,
            },
            method: "POST"
        };
        var jumboAppJSON = [];
        try {
            jumboAppJSON = AppManagerIntegrationAPI.makeAPIRequest(apiArgs);
        } catch (err) {
            gs.error("JumboAppService.getStoreJumboAppInfo(): Error occured while fetching Jumbo app json for chunk: {0}", JSON.stringify(chunk));
        }
        var response = {};
        if (jumboAppJSON.length > 0) {
            chunk.forEach(function(item) {
                response[item.source_app_id] = [];
            });
            jumboAppJSON.forEach(function(appJson) {
                response[appJson.sys_id || appJson.scope_sys_id].push(appJson);
            });
        }
        return response;
    },

    type: 'JumboAppService'
};
