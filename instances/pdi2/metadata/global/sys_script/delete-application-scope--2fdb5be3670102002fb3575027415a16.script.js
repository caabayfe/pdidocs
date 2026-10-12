(function executeRule(current, previous /*null when async*/ ) {
	
	var scopeAPI = new GlideScopeAPI();
	var scopeReleased = scopeAPI.unregisterScope(current.scope.toString(), current.getUniqueValue());
	
	if(!scopeReleased){
		gs.addInfoMessage(scopeAPI.getLastErrorMessage());
	}
	
})(current, previous);
