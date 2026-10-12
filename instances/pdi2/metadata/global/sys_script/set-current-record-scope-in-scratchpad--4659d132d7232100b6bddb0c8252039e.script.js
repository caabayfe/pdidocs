function onDisplay() {
	if (current.isNewRecord()) {
		g_scratchpad.scope = gs.getCurrentApplicationScope();
		g_scratchpad.is_custom_scope = gs.isCurrentApplicationCustom();
	}
	else {
		g_scratchpad.scope = current.sys_scope.scope || 'global';
		g_scratchpad.is_custom_scope = !current.isInGlobalScope() && !current.isInStoreScope();
	}
}
onDisplay();
