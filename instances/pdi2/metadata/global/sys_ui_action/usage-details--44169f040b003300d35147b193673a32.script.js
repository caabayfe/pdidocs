function goToDashboard() {
	var ajaxHelper = typeof snc != 'undefined' ? new snc.GlideAjax('GlideUserSubscriptionAjax') : new GlideAjax('GlideUserSubscriptionAjax');
	ajaxHelper.addParam('sysparm_name','getDashboardLink');
	ajaxHelper.addParam('sysparm_license_sys_id', g_form.getUniqueValue());
	ajaxHelper.getXMLAnswer(function(response) {
		if(response)
			g_navigation.openPopup(response); 
		else
			g_form.addErrorMessage("Error in opening license usage details.");
        
    });
}
