function onSubmit() {
   //Type appropriate comment here, and begin script below
	var cacheLifeSpan = g_form.getIntValue('oidc_config_cache_life_span');
	if(cacheLifeSpan > 720){
        g_form.addErrorMessage(getMessage('The OIDC Configuration Cache Life Span cannot exceed 720 hours'));
		return false;
    }
	
	if(cacheLifeSpan < 1){
		g_form.addErrorMessage(getMessage('The OIDC Configuration Cache Life Span must be at least 1 hour'));
		return false;
	}
	return true;
   
}
