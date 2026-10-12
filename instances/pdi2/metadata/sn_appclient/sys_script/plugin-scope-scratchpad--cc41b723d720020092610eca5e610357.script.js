(function executeRule(current, previous /*undefined when async or display*/) {
	var scopeSysId = new ScopeChecker().getSysIdByScopeName(current.scope.toString());
	g_scratchpad.sys_scope = scopeSysId||'';
})(current, typeof previous != 'undefined' ?  previous : null);
