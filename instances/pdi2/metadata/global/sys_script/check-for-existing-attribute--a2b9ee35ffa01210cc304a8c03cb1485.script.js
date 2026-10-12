(function executeRule(current, previous /*null when async*/) {
	if (!current.active) return;

	const attribute = new GlideRecord("sys_ux_macroponent_data_element_attribute");
	
	if (current.apply_to_macroponent) {
		attribute.addEncodedQuery("active=true^apply_to_macroponent=true^macroponent=" + current.macroponent);
		attribute.query();

		if (!attribute.next() || !current.isNewRecord()) return;

		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("An active macroponent attribute record already exists."));
	} else {
		attribute.addEncodedQuery("active=true^apply_to_macroponent=false^macroponent=" + current.macroponent + "^data_element_id=" + current.data_element_id);
		attribute.query();

		if (attribute.next() && current.isNewRecord()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("An active macroponent data element attribute record already exists."));
			return;
		}

		const macroponent = new GlideRecord("sys_ux_macroponent");
		macroponent.addEncodedQuery("sys_id=" + current.macroponent);
		macroponent.query();
		
		if (!macroponent.next()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Macroponent no longer exists."));
			return;
		}
		
		const dataElements = JSON.parse(macroponent.data);
		for(let i = 0; i < dataElements.length; i++) {
			if (dataElements[i].elementId == current.data_element_id)
				return;
		}

		gs.addErrorMessage(gs.getMessage("Data element id does not exist in macroponent data field."));
		current.setAbortAction(true);
	}
})(current, previous);
