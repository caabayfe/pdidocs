if (current.isNewRecord() && gs.getCurrentApplicationScope() != 'global' )
	g_scratchpad.use_scoped_format ='true';

else if (current.sys_scope.scope == 'global')
	g_scratchpad.use_scoped_format = 'false';

else
	g_scratchpad.use_scoped_format = current.use_scoped_format + '';
