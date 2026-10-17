function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
        return;
    }
    
	var tableLabel = g_form.getValue('label');
    autoFillField('user_role', generateUniqueCodeName(tableLabel, 'sys_user_role') + '_user', true);
}

function autoFillField(targetField, value, dynamic) {
    var targetDisplay = g_form.getDisplayBox(targetField);   
	var targetValue = targetDisplay.value;
    if (targetValue && targetValue != '') {
        // Target is already set.  We won't change it automatically here.
        return;
    }
    
    g_form.setValue(targetField, '', value);
	
    if (dynamic) {
		targetDisplay.title = new GwtMessage().getMessage("A new record with this value will be created automatically");
        addClassName(targetDisplay, "ref_dynamic");
    }
}

function generateUniqueCodeName(value) {
    var code = value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
	var scope = g_scratchpad.scope;
	scope = scope == 'global' ? '' : scope;
	if(scope != '') 
		code = scope + "." + code;
    else if ((scope == '') && !g_user.hasRole("maint")) {
        // Customers always use the u_ prefix for global scopes.
        code = "u_" + code;
    }

    // Compact any multiple sequential underscores
    while (code.indexOf("__") != -1) {
        code = code.replace(/__/g, "_");
    }
    
    // Replace any trailing underscores
    while (code != '' && code.charAt(code.length - 1) == '_') {
        code = code.substring(0, code.length - 1);
    }
    
    return code;
}

function generateUniqueName(value) {
    // Just return the value for now.
    return value;
}
