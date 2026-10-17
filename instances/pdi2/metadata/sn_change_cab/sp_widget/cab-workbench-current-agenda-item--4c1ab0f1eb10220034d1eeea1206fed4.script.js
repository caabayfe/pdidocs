(function() {
	data.meeting_id = $sp.getParameter('sys_id');
	data.userId = gs.getUserID();
	data.i18n = {
		currentAgendaAriaLabel: gs.getMessage('Current Agenda Change {0}'),
		ariaScheduledTime: gs.getMessage('Scheduled {0} minutes'),
	};

	data.eSignature = {
		username:  gs.getUserName(),
		userSysId: gs.getUserID(),
		isRequired: checkESig("change_request")
	};
	
	function checkESig(table) {
		if(!GlidePluginManager.isActive("com.glide.e_signature_approvals"))
			return false;
		var esigRegistryGR = new GlideRecord("e_signature_registry");
		if (!esigRegistryGR.isValid())
			return false;
		
		data.i18n.eSignatureError = gs.getMessage('An error occurred during authentication. Please contact your system administrator.');
		
		esigRegistryGR.addQuery("enabled", "true");
		esigRegistryGR.addQuery("table_name", table);
		esigRegistryGR.query();
		return esigRegistryGR.hasNext();
	}
})();
