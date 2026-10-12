function onLoad() {
    // If the AI Search enabling is not completed by the com.glide.ais plugin, hide the AI Search Configuration section
    var isAisReady = g_scratchpad.isAisEnabled;
    if (!isAisReady) {
    	g_form.setSectionDisplay('ai_search', false);
    	return;
    }

	// Pre-populate the AI Search configuration for new records
	if (g_form.isNewRecord()) {
		g_form.setValue("enable_ais", true);
		g_form.setValue("search_application", "00731b9d5b231010d9a5ce1a8581c7dd");  //Service Portal Default Search Application
		g_form.setValue("search_results_configuration", "80eb579d53671010968addeeff7b1215"); //Service Portal Search
	} else {
		/*
		Hide AI Search configuration section on form if:
		1. The portal sys_id is NOT present in the sys property glide.service_portal.enable_ais_portal.allow_list and it is not a customer created portal.
		2. It is the mesp portal.
		*/
		var mespSysId = '26f2fffb77322300454792718a1061e5';
		var enableAISearchPortals = g_scratchpad.enableAISearchPortals;
		var currentPortalSysId = g_form.getUniqueValue();
		var portalSysIds = enableAISearchPortals.split(/\s*,\s*/).map(function(portalSysId) {
			return portalSysId.trim();
		});
		
		if ((portalSysIds.indexOf(currentPortalSysId) === -1 
			&& !g_scratchpad.isCustomerCreatedPortal)
			|| currentPortalSysId === mespSysId)

			g_form.setSectionDisplay('ai_search', false);
	}
}
