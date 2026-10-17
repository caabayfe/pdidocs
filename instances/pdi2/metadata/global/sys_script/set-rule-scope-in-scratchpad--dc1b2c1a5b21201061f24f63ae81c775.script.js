(function executeRule(current, previous /*null when async*/) {

	var genius_only = current.genius_only;
	g_scratchpad.rule_scope = genius_only? 'genius' : 'search_genius';
	
})(current, previous);
