(function executeRule(current, previous /*null when async*/) {
	var ais = new sn_ais.StatusApi();
	g_scratchpad.isAisEnabled = ais.isAisEnabled() && ais.isAisInitialized();
	g_scratchpad.enableAISearchPortals = gs.getProperty('glide.service_portal.enable_ais_portal.allow_list');

	var currentPortalId = current.getValue('sys_id');
	g_scratchpad.isCustomerCreatedPortal = isCustomerCreatedPortal() || isCustomScopedAppPortal();

	function isCustomScopedAppPortal() {
		var scope = current.sys_scope.scope || '';
		return scope && scope.startsWith('x_');
	}

	function isCustomerCreatedPortal() {

		var isCustomerCreated = false;
		var encodedQueryName = 'name=sp_portal_'+ currentPortalId;

		var gr = new GlideRecord('sys_update_version');
		gr.setLimit(1);
		gr.addEncodedQuery(encodedQueryName);
		gr.query();

		if (gr.hasNext()) {

			gr = new GlideRecord('sys_update_version');
			gr.setLimit(1);
			gr.addEncodedQuery(encodedQueryName + '^source_tableINsys_upgrade_history,sys_store_app');
			gr.query();

			if (!gr.hasNext())
				isCustomerCreated = true;
		}

		return isCustomerCreated;
	}
})(current, previous);
