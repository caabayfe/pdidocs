function onSubmit() {

	//Caution: when updating this script be sure to update also 'Validate copy group regex string' business rule
	
    var selectedMappingTypeValue = g_form.getValue('mapping_type');
    
	// Mapping type 6 is 'Map field and copy value from regex group'
	// Only this mapping type has 'Copy group regex' field that should be validated to contain a valid regex
    if (selectedMappingTypeValue !== '6') {
		return true;
    }
	
	var regexStr = g_form.getValue('copy_group_regex');
	
	try {
		/*
			Execute regexStr + '|' with an empty string to find capturing groups.
			In case of a valid regex, there will always be one matching group which is the whole string.
			So, we substract 1 to get the group count in original expression string.
		*/
		var nCapturingGroups = new RegExp(regexStr + '|').exec('').length - 1;
		
		// The expression should have EXACTLY ONE matching group to be mapped to to_field
		if (nCapturingGroups !== 1) {
			var msg = new GwtMessage().getMessage("'Copy group regex' should include exactly one group");
			g_form.showErrorBox('copy_group_regex', msg, true);
			
			// Prevent submission
			return false;
		}
		
		// Allow submission
		return true;
		
	} catch (e) {
		var invalidRegexMsg = new GwtMessage().getMessage("The value of 'Copy group regex' is not a valid regular expression");
		g_form.showErrorBox('copy_group_regex', invalidRegexMsg, true);
		
		// Prevent submission
		return false;
	}
}
