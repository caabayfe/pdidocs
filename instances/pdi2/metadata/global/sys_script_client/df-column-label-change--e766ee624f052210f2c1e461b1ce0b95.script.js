function onChange(control, oldValue, newValue, isLoading) {
	//there is another early return in the datastore part of this code
	if (isLoading)
		return;
	
	var columnName = g_form.getValue('element');
	var previousValue = oldValue;
	var pvalues = g_scratchpad.dictionary_field_values;
	
	//Since oldValue is always the value of the field when the form loaded
	//and we have a desire to know what we are changing from
	//lets keep a datastore in the scratchpad	
	try {
		if (!pvalues) {
			g_scratchpad.dictionary_field_values = {};
			pvalues = g_scratchpad.dictionary_field_values;
		}
		
		if (pvalues.hasOwnProperty('column_label'))
			previousValue = pvalues.column_label;
		
		pvalues.column_label = newValue;
		
		//If we are clearing the field, that's OK but we need to store the empty value
		if (!newValue) {
			pvalues.column_label = '';
			return;
		}
		
	} catch (e) {
		jslog("Unable to read scratchpad.");
	}
	
	//if the user can't set the field, we shouldn't touch it
	if (g_form.isDisabled('element'))
		return;

	ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {

		var sanitizer = new DBNameSanitizer();

		var label = sanitizer.trimName(newValue);
		var oldLabel = sanitizer.trimName(previousValue);
		var prefix = getPrefix(sanitizer.MAINT_PREFIX,
							   sanitizer.CUSTOMER_PREFIX,
							   sanitizer.VENDOR_PREFIX_DELIMCHAR);
				
		var defaultNewColumnName = prefix + label;
		var defaultOldColumnName = prefix + oldLabel;
		
		//if the column is still using the default value, then update it to the new default value
		if (columnName == defaultOldColumnName) {
			sanitizer.setValueOnTargetElement('element', defaultNewColumnName, 'Column');
			return;
		}
		
		//if the column name was *changed* from the old default, keep the existing name if it's prefixed
		if (prefix && columnName.startsWith(prefix))
			return;
		
		//set the new name (including prefix)
		sanitizer.setValueOnTargetElement('element', defaultNewColumnName, 'Column');
		
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
