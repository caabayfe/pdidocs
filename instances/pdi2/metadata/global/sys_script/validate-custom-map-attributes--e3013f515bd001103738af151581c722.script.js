(function executeRule(current, previous /*null when async*/) {
	
	function attributeExists(current, attributeName, parentInput) {
		var attribute = new GlideRecord("sys_sg_input_attribute");
		attribute.addQuery("name", attributeName);
		attribute.addQuery("input", parentInput);
		attribute.setLimit(1);
		attribute.query();
		
		return attribute.next();
	}
	
	function abort(current, message) {
		current.setAbortAction(true);
		gs.addErrorMessage(message);
	}
	
	function recordExists(table, id) {
		var record = new GlideRecord(table);
		return record.get(id);
	}
	
	function validateCustomMapInputs(current, attributeValue) {
		try {
			var inputs = JSON.parse(attributeValue);
			if (Array.isArray(inputs)) {
				for(var index = 0; index < inputs.length; index++) {
					if (!recordExists("sys_sg_input", inputs[index].Id)) {
						abort(current, gs.getMessage("Custom map input does not exist."));
						break;
					}
				}
				return;
			}
		} catch(e) {
			gs.warn(e);
		}
		abort(current, gs.getMessage("Custom map inputs must be a JSON array."));
	}
	
	var attributeName = current.name.toString();
	var parentInput = current.input.toString();
	var attributeValue = current.value.toString();
	
	// Do not validate none custom map input attributes
	var isCustomMapInputAttribute = /^CustomMap(ConfigId|DefaultProviderId|Inputs)$/.test(attributeName);
	if (!isCustomMapInputAttribute)
		return;
	
	// Check if parent input is of type custom_map
	var isInputCustomMap = current.input.type.name.toString() === "custom_map";
	if (!isInputCustomMap)
		return;
	
	// Check if the custom map attribute already exists for the custom map input
	if (current.operation() === "insert" && attributeExists(current, attributeName, parentInput)) {
		abort(current, gs.getMessage("Custom map attribute already exists for input."));
		return;
	}
	
	// Validate attribute value based on attribute name
	if (attributeName === "CustomMapInputs")
		validateCustomMapInputs(current, attributeValue);
	else if (attributeName === "CustomMapConfigId" && !recordExists("sys_sg_custom_map_config", attributeValue))
		abort(current, gs.getMessage("Custom map config does not exist"));
	else if (attributeName === "CustomMapDefaultProviderId" && !recordExists("sys_sg_custom_map_provider", attributeValue))
		abort(current, gs.getMessage("Custom map provider does not exist"));
	
})(current, previous);
