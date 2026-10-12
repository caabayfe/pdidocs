var AppClientCacheHelper = Class.create();
AppClientCacheHelper.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
	refreshAppManagerCache: function() {
		if(gs.getProperty("sn_appclient.enable_app_manager_cache", "true") !== "true")
			return;
		var installedAppSourceAppId = this.getParameter('sysparm_source_app_id');
		var sharedInternally = this.getParameter('sysparm_shared_internally') == "true";
		var specificAppsToUpdate = [];
		specificAppsToUpdate.push({
			sourceAppId: installedAppSourceAppId,
		});
		
		var args = {
			specificAppsToUpdate: specificAppsToUpdate, 
			sharedInternally: sharedInternally,
			honourChecksum: false
		};
		
		new global.AppManagerCache().deleteAppsFromCache(args);
		new UpdateChecker().refreshChecksum();
	},

    type: 'AppClientCacheHelper'
});
