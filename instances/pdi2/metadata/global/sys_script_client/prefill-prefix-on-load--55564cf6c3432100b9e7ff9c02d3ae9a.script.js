function onLoad() {
	if (!g_form.isNewRecord())
		return;

	var scope = g_scratchpad.scope;
	scope = scope == 'global' ? '' : scope + '.';
	g_form.setValue('name', scope);
}
