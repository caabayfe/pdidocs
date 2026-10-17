function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '')
		return;

	// leave global alone (legacy behavior is write-able)
	var isGlobal = (g_scratchpad.scope||'global') == 'global';
	if (isGlobal)
		return;
	
	// only do for new records
	if (!g_form.isNewRecord())
		return;
	
	var isCustomScope = false;
	if (g_scratchpad.hasOwnProperty('is_custom_scope'))
		isCustomScope = !!g_scratchpad.is_custom_scope;
	
	// For private APIs, set default protection policy to read-only
	var isPrivate = newValue == 'package_private';
	var isEditable = (g_form.getValue('sys_policy')||'') == '';
	
	if (isPrivate && isEditable && isCustomScope) {
		g_form.setValue('sys_policy', 'read');
	}
}
