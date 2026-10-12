function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	// if there's an existing value in the 'name' form field when the page loads, store the value
	if (oldValue && isLoading) {
		g_scratchpad.previous_image_name = oldValue;
	}
	
	// if the user emptied out the contents of the field, do not run the rest of the logic
	if (newValue === '') {
		g_scratchpad.previous_image_name = '';
        return;
    }
	
    // oldValue is always the value of the field when the form loaded.
    // we don't want to do anythign if the newValue (the value of the field onChange) is the same 
    // as when the form loaded
    if (newValue === oldValue) {
        return;
    }

    if (isLoading) {
        return;
    }

    // retrieve the scope of the record
    var imageScope = g_scratchpad.scope;
	
	// if scope is not present or it's global, let them define the 'name' field however they wish
    if (imageScope == '' || imageScope == 'global') {
        
        return;
    }
	
	// the user made some manual modifications to the existng form field item, do not run 
	// scope prepending logic
	if (g_scratchpad.hasOwnProperty("previous_image_name") && g_scratchpad.previous_image_name !== '') {
		return;
	}

    if (newValue.indexOf(imageScope) === -1) {
		var newImageName = imageScope + '.' + newValue;
        g_form.setValue("name", newImageName);
        g_scratchpad.previous_image_name = newImageName;
        return;
    }
	
    g_scratchpad.previous_image_name = newValue;
}
