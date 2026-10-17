function onBefore(current, previous) {
	var hint = new GlideIndexHintQueryRewrite(current);
	current.lookup_key = hint.getLookupKey();
	current.replacement = hint.getReplacement();
	// PG lookup_key is always "match all" regex, so we use it as an indicator that this is pg_hint 
	// Therefore rewrite type should be regex_replacement
	if (current.lookup_key == '(.*)') 
		current.type = 'regex_replacement';  
}
