restrictIncidents();
function restrictIncidents() {
	if (!gs.hasRole("itil") && !gs.hasRole("sn_incident_read") && gs.isInteractive()) {
		//Do NOT restrict Incidents if user has the service_viewer role.
		if (gs.hasRole('service_viewer'))
			return;
		if (GlidePluginManager.isActive('sn_fsm_itsm_mng') && gs.hasRole('wm_ext_agent'))
			return;
		// STRY52118544: ham_user is added to support incident read for reporting on HAM store app
		if (GlidePluginManager.isActive('com.sn_hamp') && gs.hasRole('sn_hamp.ham_user')) {
			return;
		}
		// DEF0330091: Allow query on OT Incident with sn_ot_incident_read role
		if (GlidePluginManager.isActive('com.sn_ot_inc_mgmt') && gs.hasRole("sn_ot_incident_read"))
			return;

		// Responders should be able to access all incidents 
		if (gs.hasRole("sn_sow_srm.srm_responder")) {
			return;
		}
			
		var u = gs.getUserID();
		current.addQuery("caller_id", u).addOrCondition("opened_by", u).addOrCondition("watch_list", "CONTAINS", u);
	}
}
