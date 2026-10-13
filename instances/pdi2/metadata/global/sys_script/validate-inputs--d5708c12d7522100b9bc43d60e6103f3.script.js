validateInput();

function validateInput() {

	//Caution: when updating this script be sure to update also client scripts

	//check the name field is valid
	current.name = current.name.trim();
	if(gs.nil(current.name)){
		gs.addErrorMessage(gs.getMessage('Name field cannot be empty'));
		current.setAbortAction(true);
		return;
	}
	
	current.event_class = current.event_class.trim();
    current.filter = current.filter.trim();
	
	//when no filter condition is given, "empty" word is getting stored in the table. so changing "empty" to ""
	if(current.filter == "empty") {
		current.filter = "";
	}
	
	if( gs.nil(current.event_class)  &&  gs.nil(current.filter) ) {
		gs.addErrorMessage( gs.getMessage('The Source and Filter fields cannot both be empty. Specify a value in one or both of these fields.') );
		current.setAbortAction(true);
		return;
	}
	
	// Check that "from_field" field is valid (not relevant for script, reference table and constant)
	if (current.mapping_type != "7" && current.mapping_type != "2" && current.mapping_type != "8") {
		current.from_field = current.from_field.trim();
		current.value = '';
		if(gs.nil(current.from_field)) {
			gs.addErrorMessage(gs.getMessage("Invalid 'Source field' : {0}", [current.from_field]));
			current.setAbortAction(true);
			return;
		}
	}
	
	if (current.mapping_type == "2" || current.mapping_type == "8") {	// "constant" or "Map field from reference table"
		current.from_field = '';
	}

	if (current.mapping_type == "7") { //The follwing validations are not relevant for "script" mapping type
		return;
	}

	//------------Target Field Validations 
	// Relevant for all mapping types except "scipt"
	// 1. check that target is not "additional_info"
	// 2. check that target field does not contain forbidden prefixes ('alert_cmdb_ci.', 'alert_cmdb_ci_key.' or 'additional_info.')

    current.to_field = current.to_field.trim();
    if (gs.nil(current.to_field) || (current.to_field == "additional_info")) {
        gs.addErrorMessage(gs.getMessage("Invalid 'Target field' : {0}", [current.to_field]));
        current.setAbortAction(true);
        return;
    }
    
    //validate prefixes in Target field 
	var eventRuleUtil = new EventRuleUtil();
    var addInfoPrefix = eventRuleUtil.getFieldMappingFromFieldAddInfoPrefix();
	var cmdbCiPrefix = eventRuleUtil.getFieldMappingFromFieldCmdbCiPrefix();
	var cmdbKeyValuePrefix = eventRuleUtil.getFieldMappingFromFieldCmdbKeyValuePrefix();

	var notValidPrefixes = [addInfoPrefix, cmdbCiPrefix, cmdbKeyValuePrefix];

    for (var i = 0; i < notValidPrefixes.length; i++) {
        var prefix = notValidPrefixes[i];
        if ((prefix) && current.to_field.startsWith(prefix)) {
            gs.addErrorMessage(gs.getMessage("Can't use '{0}' prefix in 'Target field'", prefix));
            current.setAbortAction(true);
            return;
        }
    }

	//------------Source Field Validations 
	// Relevant for all mapping types except "scipt"
	// 1. Does not contain space before and after the dot
	// 2. In “Map field using regex” source field can’t start with “alert_cmdb_ci.”, “alert_cmdb_ci_key

	// check that Source Field does not contain space before and after the dot
	// this check is not relevant for cmdb key value 
	var valueToCheck = current.from_field;
	var sourceFieldStartsWithCmdbKeyValuePrefix = (cmdbKeyValuePrefix) && valueToCheck.startsWith(cmdbKeyValuePrefix);
	if (!sourceFieldStartsWithCmdbKeyValuePrefix && (valueToCheck.includes(' .') || valueToCheck.includes('. '))) {
		gs.addErrorMessage(gs.getMessage("'Source field' cannot contain space"));
		current.setAbortAction(true);
		return;	
	}

	//check ci prefixes in 'Source field' for "Map field using regex" mapping type
	if (current.mapping_type == "5") {
		notValidPrefixes = [cmdbCiPrefix, cmdbKeyValuePrefix];
		for (var i = 0; i < notValidPrefixes.length; i++) {
			var prefix = notValidPrefixes[i];
			if ((prefix) && current.from_field.startsWith(prefix)) {
				gs.addErrorMessage(gs.getMessage("Can't use '{0}' prefix in 'Source field' for selected mapping type", prefix));
				current.setAbortAction(true);
				return;
			}
		}
	}
}
