var AppManagerGCFAjax = Class.create();
AppManagerGCFAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	captureAppManagerAnalytics: function(collectionPoint, collectionEvent, collectionData) {
		new sn_appclient.AppClientGCFUtil().recordEvent(collectionPoint, collectionEvent, collectionData);		
	},
	
	capturePluginInstallationTime: function() {
		var installationStartTime = (!gs.nil(this.getParameter("sysparm_install_start_time")))?new GlideDateTime(this.getParameter("sysparm_install_start_time")).getNumericValue() : new GlideDateTime().getNumericValue();
		var installationEndTime = new GlideDateTime().getNumericValue();
		var pluginId = this.getParameter("sysparm_plugin_id");
		var collectionData = {};
		collectionData.time = ((installationEndTime - installationStartTime)/1000).toFixed(2);
		collectionData.app_id = pluginId;
		collectionData.entity_type = "Plugin";
		this.captureAppManagerAnalytics("app_install", "installation_time", collectionData);
	},

	capturePluginInstallAnalytics: function() {
		var collectionData = this.getParameter('sysparm_collection_data') ? JSON.parse(this.getParameter('sysparm_collection_data')):{};
		collectionData.entity_type = "Plugin";
		collectionData.installation_type = "Standalone Install";
		this.captureAppManagerAnalytics("install", "app_install", collectionData);
	},
    type: 'AppManagerGCFAjax'
});
