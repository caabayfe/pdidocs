answer = true;
	if (GlidePluginManager.isActive('com.sn_cs_sm')){
	    answer = new sn_cs_sm.ServiceManagementIncidentUtils().isValidCallerForIncNotif(current.caller_id.getRefRecord());
	}
