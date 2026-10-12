function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '' || !g_form.isNewRecord()) {
		return;
	}
	
	var scope = g_form.getValue('scope');
	var userRolePrefix = scope != null && scope.length > 0 ? scope : newValue;
	autoFillField('user_role', generateUniqueNameForUserRole(userRolePrefix), true);
	autoFillField('menu', generateUniqueName(newValue, 'sys_app_application'), true);
}

function autoFillField(targetField, value, dynamic) {
	var targetDisplay = g_form.getDisplayBox(targetField);
	var targetValue = targetDisplay.value;
	if (targetValue && targetValue != '') {
		// Target is already set.  So don't change if set to an existing value.
		// If set to new value to be created dynamically, then allow it to be changed again.
		if(!hasClassName(targetDisplay, 'ref_dynamic'))
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

	if (!g_user.hasRole("maint"))
		code = g_form.getValue('scope') + '_';
	
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

function generateUniqueName(value,table) {
	// Just return the value for now.
	return value;
}

function generateUniqueNameForUserRole(value) {
	var MAXTRIES = 20;
	var MULTIPLIER = 100;
	var numTries = 0;
	// generate the code first, then check for dups.
	var code = generateUniqueCodeName(value);
	var name = code;
	
	while(userRoleExists(name+'.user')) {
		// generate a new name
		name = code + Math.floor((Math.random() * MULTIPLIER) + 1);
	
		//  stopper so it doesn't go infinite.
		numTries++;
		if(numTries > MAXTRIES) {
			name = code + ".user";
			g_form.addErrorMessage("Duplicate user role name, "+name);
			return name;
		}
	}
	name += '.user';
	return name;
}

function userRoleExists(value) {
	var gr = new GlideRecord('sys_user_role');
	gr.addQuery("name",value);
	gr.query();
	return gr.hasNext();
}
