(function executeRule(current, previous /*null when async*/) {
	var properties = []; 
	var outputPropMapping = {};
	
	try {
		properties = JSON.parse(current.props);
	} catch(e) {
		//Leaving this as warn instead of stopping update as UXF's macroponent validator handles schema checking
		gs.warn("Unable to parse controller properties", e);
	}
	
	try {
		outputPropMapping = JSON.parse(current.output_prop_mapping);
	} catch(e) {
		//Leaving this as warn instead of stopping update as UXF's macroponent validator handles schema checking
		gs.warn("Unable to parse controller output prop mapping", e);
	}
	
	var propertyKeys = properties.map(function(prop) {
		return prop.name;
	});
	
	propertyKeys = propertyKeys.concat(Object.keys(outputPropMapping));
	
	var duplicateKeys = propertyKeys.filter(function(item, index) {
		return propertyKeys.indexOf(item) !== index;
	});
	
	if(duplicateKeys.length > 0) {
		gs.addErrorMessage(gs.getMessage("Please make sure there are no duplicate keys between Output Prop Mappings and Properties: {0}", duplicateKeys));
		current.setAbortAction(true);
		return;
	}
	
	if(propertyKeys.indexOf("inputs") > -1) {
		gs.addErrorMessage(gs.getMessage("\"inputs\" is a reserved property which is used to expose out the input properties of a controller."));
		current.setAbortAction(true);
		return;
	}

})(current, previous);
