            var AppstoreIntegration = Class.create();
            AppstoreIntegration.prototype = {
                initialize: function () {
                    this._quiet = gs.getProperty("sn_appclient.http_check_updates_quietly", "true") == "true";
                },

                callPluginDependenciesWebservice: function(pluginList) {
                    var dependendentPlugin = {};
                    var content = {};
                    content.instance_id = gs.getProperty('instance_id');
                    content.plugins = pluginList.toString();
                    var pluginDependencyRequestObj = new ScopedAppRepoRequest("get_dependent_apps", content);
                    var pluginDependencyResponse = pluginDependencyRequestObj
                        .setQuiet(this._quiet)
                        .post();

                    try {
                        var responseStatusCode = pluginDependencyRequestObj.getStatusCode();
                        if (responseStatusCode != 200)
                            throw new Error("Unable to get the response from store with status code >> {0}", responseStatusCode);

                        dependendentPlugin = new global.JSON().decode(pluginDependencyResponse);
                    } catch (error) {
                        dependendentPlugin.result = {};
                        dependendentPlugin.result.errors = error.message;
                    }

                    return dependendentPlugin;
                },

                getPluginDependency: function (pluginList) {
                    var masterPluginList = Array.isArray(pluginList) ? pluginList : new PluginDao().getActiveWhitelistPlugins();
                    if(masterPluginList.length < 1)
                        return;

                    var response = this.callPluginDependenciesWebservice(masterPluginList);
                    gs.debug("Response of the appstore call: " + new global.JSON().encode(response));

                    if (response && !gs.nil(response.errors)) {
                        gs.error("Call not processed completely, error thrown by appstore: " + new global.JSON().encode(response));
                        return;
                    }

                    var responseData = response.messages;
                    var appPluginMapDao = new AppPluginMapDao();
                    var pluginDependentApplicationDao = new PluginDependentApplicationDao();

                    if (responseData && !gs.nil(responseData.applications)) {
                        gs.debug("Updating Applications Data");
                        var mappedAppList = appPluginMapDao.getMappedAppsList(masterPluginList);
			 pluginDependentApplicationDao.markCurrentFalse(mappedAppList);
                        pluginDependentApplicationDao.upsertMultipleApplication(responseData.applications);
                        pluginDependentApplicationDao.deleteInvalidEntries();
                    }
                    if (responseData && responseData.plugin_app_list) {
                        gs.debug("Updating Plugin App Mapping Data");
                        appPluginMapDao.markCurrentFalse(pluginList);
                        appPluginMapDao.upsertMultiplePluginAppMapping(responseData.plugin_app_list);
                        appPluginMapDao.deleteInvalidEntries();
                    }
                    if (responseData && !gs.nil(responseData.whitelist_plugins)) {
                        gs.debug("Updating Plugins Data");
                        new PluginDao().updateWhitelist(responseData.whitelist_plugins);
                    }

                },

				is_installed:function(source_app_id, scope, version){
					var gr = new GlideRecord("sys_store_app");
					gr.addQuery("sys_id",source_app_id);
					gr.addQuery("scope",scope);
					gr.addQuery("version",version);
					gr.query();
					return gr.next();
				},

                can_install_update:function(source_app_id){
                    var grStoreApp = new GlideRecord("sys_store_app");
                    grStoreApp.addQuery("sys_id", source_app_id);
                    grStoreApp.addActiveQuery();
                    grStoreApp.addNotNullQuery('version');
                    grStoreApp.query();
                    if(grStoreApp.getRowCount() > 0)
                        return grStoreApp.getValue("version") != grStoreApp.getValue("latest_version");

                    var grRemoteApp = new GlideRecord("sys_remote_app");
                    grRemoteApp.get(source_app_id);
                    return grRemoteApp.getRowCount() > 0;
                },

                type: 'AppstoreIntegration'
            };
            
