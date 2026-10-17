function onChange(control, oldValue, newValue, isLoading) {
	//there is another early return in the datastore part of this code
	if (isLoading)
		return;
	
	//Since oldValue is always the value of the field when the form loaded
	//and we have a desire to know what we are changing from
	//lets keep a datastore in the scratchpad
	var previousValue = oldValue;
	var pvalues = g_scratchpad.dictionary_field_values;
		
	try {
		if (!pvalues) {
			//we don't have a datastore, so create it
			g_scratchpad.dictionary_field_values = {};
			pvalues = g_scratchpad.dictionary_field_values;
		}
		
		//If we had a datastore, lets see what our previous value was
		if (pvalues.hasOwnProperty('column_name'))
			previousValue = pvalues.column_name;
		
		//If we are clearing the field, that's OK but we need to store the empty value
		if (!newValue) {
			pvalues.column_name = '';
			return;
		}
	} catch (e) {
		jslog("Unable to read scratchpad.");
	}

	ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {
		// logic to hide error message, this was the original intent of this client script
		if (previousValue === newValue)
			g_form.hideFieldMsg('element');

		var sanitizer = new DBNameSanitizer();
		newValue = sanitizer.trimName(newValue);
		
		var prefix = getPrefix(sanitizer.MAINT_PREFIX,
							   sanitizer.CUSTOMER_PREFIX,
							   sanitizer.VENDOR_PREFIX_DELIMCHAR);
		
		if (!prefix || newValue.startsWith(prefix))
			return;
		
		//Store the current new value in our data store
		pvalues.column_name = newValue;
		
		sanitizer.setValueOnTargetElement('element', prefix + newValue, 'Column');
	});
}

function getPrefix(maintPrefix, customerPrefix, prefixDelimiter) {
	var scope = g_scratchpad.scope;
	var isStoreApp = checkIfStoreApp(scope);
	var tableName = g_form.getValue('name');

	if (isStoreApp)
		return customerPrefix;

	var name = g_form.getValue('element');
	if (scope === 'global') {
		// Assume that if a table is not global, it belongs to a sys_store_app.
		// Editing a sys_app table in global is not allowed, so we can forego that check.
		if (!tableInCurrentScope(tableName))
			return customerPrefix;

		// Customers always use the u_ prefix for global scopes, except for sys_overrides and
		// sys_domain fields (which are allowed bare).
		if (g_user.hasRole('maint') || name === 'sys_overrides' || name === 'sys_domain')
			return maintPrefix;

		return customerPrefix;
	}

	if (g_form.getValue('name').startsWith(scope))
		return maintPrefix;

	return scope + prefixDelimiter;
}

function tableInCurrentScope(tableName) {
	var tablesInCurrentScope = g_scratchpad.inScopeTableList;
	return tablesInCurrentScope && tablesInCurrentScope.indexOf(tableName) !== -1;
}

function checkIfStoreApp(scope) {
	var gr = new GlideRecord('sys_scope');
	gr.addQuery('scope', scope);
	gr.query();
	if (gr.next())
		return gr.getValue('sys_class_name') === 'sys_store_app';
	return false;
}
