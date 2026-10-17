(function executeRule(current, previous /*null when async*/ ) {
	let inputMap;
	try {
		inputMap = JSON.parse(current.getValue("interaction_input_map") || "{}");
		new JsonFormatterForMetadataRecords().formatJsonRecord(current);
	} catch (e) {
		gs.addErrorMessage(gs.getMessage("Unable to parse JSON for 'Input Map': {0}", e));
		current.setAbortAction(true);
		return;
	}

	const gr = new GlideRecord("sys_ui_interaction");
	if (!gr.get(current.interaction)) {
		gs.addErrorMessage(gs.getMessage("Unable to locate UI interaction record."));
		current.setAbortAction(true);
		return;
	}

	let inputs;
	try {
		inputs = JSON.parse(gr.getValue("inputs") || "[]");
	} catch (e) {
		gs.addErrorMessage(gs.getMessage("Unable to parse UI interaction inputs. Error: {0}", e));
		current.setAbortAction(true);
		return;
	}

	const isEmpty = (value) => (value === null || value === undefined || value === '');

	inputs.some((input) => {
		if (input.required && isEmpty(inputMap[input.name])) {
			gs.addErrorMessage(gs.getMessage("Missing required UI interaction input: {0}.", input.name));
			current.setAbortAction(true);
			return true;
		}
	});
})(current, previous);
