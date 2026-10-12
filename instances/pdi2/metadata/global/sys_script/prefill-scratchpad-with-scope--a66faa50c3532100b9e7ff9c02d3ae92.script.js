g_scratchpad.scope = '';

if (!gs.isCurrentApplicationInGlobalScope())
	g_scratchpad.scope = gs.getCurrentApplicationScope();
