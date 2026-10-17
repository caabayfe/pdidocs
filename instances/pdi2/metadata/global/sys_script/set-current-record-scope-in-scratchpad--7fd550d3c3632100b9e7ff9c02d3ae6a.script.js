function onDisplay() {
	if (current.isNewRecord())
		g_scratchpad.scope = gs.getCurrentApplicationScope();
	else
		g_scratchpad.scope = current.sys_scope.scope || 'global'
}
onDisplay();
