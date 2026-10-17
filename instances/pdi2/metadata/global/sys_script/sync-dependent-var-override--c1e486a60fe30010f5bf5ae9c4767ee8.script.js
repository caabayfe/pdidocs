(function onExec() {
	if (current.dependent_on_field == "")
		return current.dependent = "";
	
	var varTableElements = {
		'sys_pd_activity_type_prop' : 'type_vals'
	};
	var prefix = "";
	// some types don't use the prefix 
	if (current.internal_type != "document_id" && current.internal_type != "url") {
		//for everything else - pre-pend the var element name
		var extension = current.sys_class_name;
		if (extension in varTableElements) {
			//prefix has been explicitly provided
			prefix = varTableElements[extension];
		} else if (extension.indexOf('input')>0) {
			//it looks like an input table
			prefix = 'inputs';
		} else if (extension.indexOf('output')>0) {
			//it look like an output table
			prefix = 'outputs';
		} else {
			prefix ='vars';
		}
	}

	if (!current.dependent_on_field.startsWith(prefix)) {
		//add the prefix if its not already there
		current.dependent_on_field = prefix + "." + current.dependent_on_field; 	
	}
	
	// make dependent and dependent_on_field consistent values
	current.dependent = current.dependent_on_field;
})();
