function getResults(input) {
	const { sysId } = input;

	var resultGr = new GlideRecordSecure("kb_assist_scan_result");
	resultGr.addQuery("target_record", sysId);
	resultGr.addQuery('state', 'NOT IN', 'closed,ignore');
	resultGr.orderBy('order');
	resultGr.query();

	var resultObj = {};
	while (resultGr.next()) {
		var scanDefinition = resultGr.getValue("scan_definition");
		if (!resultObj[scanDefinition]) {
			resultObj[scanDefinition] = {};
			var scanGr = new GlideRecordSecure("kb_assist_scan_definition");
			scanGr.get(scanDefinition);
			resultObj[scanDefinition].sysId = scanGr.getValue("sys_id");
			resultObj[scanDefinition].name = scanGr.name.getDisplayValue();
			resultObj[scanDefinition].short_description = scanGr.short_description.getDisplayValue();
			resultObj[scanDefinition].scan_type = scanGr.getValue("execution_type") == "script" ? "script" : "now_assist";
			resultObj[scanDefinition].scanDefinitionSysId = scanGr.getValue("sys_id");
			resultObj[scanDefinition].targetRecordSysId = sysId;
			resultObj[scanDefinition].order = scanGr.getValue("order");
			resultObj[scanDefinition].actionType = scanGr.getValue("action_type");
			resultObj[scanDefinition].optimizationType = scanGr.getValue("optimization_type");
			resultObj[scanDefinition].replaceDescription = !!(scanGr.replace_description || false);
			// Hide a scan's card in the per-article AO panel when hide_in_panel=true.
			// Boolean getValue() returns "1"/"0"/"" — compare explicitly ("0" is truthy in JS).
			resultObj[scanDefinition].visible = (scanGr.getValue("hide_in_panel") != "1");
			resultObj[scanDefinition].results = [];

			//Set Inputs
			resultObj[scanDefinition].inputs = [];
			var inputsGr = new GlideRecordSecure("kb_assist_scan_definition_input");
			inputsGr.addQuery("scan_definition", scanDefinition);
			inputsGr.query();
			while (inputsGr.next()) {
				resultObj[scanDefinition].inputs.push({
					"name": inputsGr.getValue("name"),
					"label": inputsGr.getValue("label"),
					"fieldType": inputsGr.getValue("input_type")
				});
			}

			//Set action Label
			const actionLabel = scanGr.action_label.getDisplayValue();
			if (actionLabel) {
				resultObj[scanDefinition].actionLabel = actionLabel;
			} else if (resultObj[scanDefinition].inputs.length > 0) {
				resultObj[scanDefinition].actionLabel = gs.getMessage("Review");
			} else {
				resultObj[scanDefinition].actionLabel = gs.getMessage("Update");
			}
		}
		var scanResult = {};
		try {
			scanResult = JSON.parse(resultGr.getValue("result"));
		} catch (e) {
			//do nothing
		}
		resultObj[scanDefinition].results.push({
			result: scanResult,
			sysId: resultGr.getValue("sys_id"),
			message: resultGr.message.getDisplayValue(),
			state: resultGr.getValue("state")
		});

	}

	//convert object into array of cards
	var scans = Object.keys(resultObj);
	if (scans.length == 0)
		return [];

	var resultArray = scans.map(scan => {
		return {
			...resultObj[scan]
		};
	});
	resultArray = resultArray.sort((a, b) => {
		return a.order - b.order;
	});

	return resultArray;
}
