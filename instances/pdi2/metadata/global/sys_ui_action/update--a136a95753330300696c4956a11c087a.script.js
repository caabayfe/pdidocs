var valid = new SNC.OIDCProviderTester().testProvider(current.sys_id, current.name, current.oidc_url, current.oidc_config_cache_life_span, current.user_claim); 
if ( valid < 0) 
	current.setAbortAction(true);
else 
	current.update();

if (valid  > 0)
	action.setRedirectURL(current);
	
