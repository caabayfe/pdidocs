(function executeRule(current, previous /*null when async*/ ) {
if (gs.isInteractive()) {
	var action = gs.action;

	if (action != null && action.hasGlideURI() && action.getGlideURI().toString().indexOf('ais_connection') != -1){
		var grAis = new GlideRecord('ais_connection');
		grAis.addQuery('type', '0');
		grAis.query();

		if (grAis.next()) {
			var aisUtil = new sn_ais.AisUtil();
			var requiredVersion = aisUtil.getRequiredAisNodeVersion();
			var availableVersion = grAis.getValue('ais_node_version');

			if (availableVersion && aisUtil.isAisNodeUpdateRequired(availableVersion))
				gs.addErrorMessage(gs.getMessage("AIS active connection version mismatch, expected {0} while installed {1}",[requiredVersion, availableVersion]));
		}
	}
}
})(current, previous);
