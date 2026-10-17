(function executeRule(current, previous /*null when async*/) {
	var errorMessage = gs.getMessage("Invalid mapping! Please add a mapping as per configuration.");

	var tableConfigGR = new GlideRecord("service_table_config");
	tableConfigGR.addQuery("service_table", current.service_table);
	tableConfigGR.query();
	if(tableConfigGR.next()) {
		
		var mappingLevel = tableConfigGR.getValue("mapping_level");
		if(mappingLevel === "service" && (gs.nil(current.csdm_service) || !gs.nil(current.csdm_service_offering))) {
			gs.addErrorMessage(errorMessage);
			current.setAbortAction(true);
		}

		if(mappingLevel === "service_offering" && (gs.nil(current.csdm_service_offering) || !gs.nil(current.csdm_service))) {
			gs.addErrorMessage(errorMessage);
			current.setAbortAction(true);
		}
	} else {
		gs.addErrorMessage(errorMessage);
		current.setAbortAction(true);
	}

})(current, previous);
