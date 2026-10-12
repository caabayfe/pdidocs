action.setRedirectURL(current);
var valid = new SNC.OIDCProviderTester().testProvider(current.sys_id, current.name, current.oidc_url, current.oidc_config_cache_life_span, current.user_claim); 
if ( valid < 0) 
	current.setAbortAction(true);
else 
	doInsertAndStay();

function doInsertAndStay() {
    var saveMe = current;
    if (typeof current.number != 'undefined' && current.number)
        current.number = ""; // generate a new number
    else if (typeof current.u_number != 'undefined' && current.u_number)
        current.u_number = ""; // generate a new number
    current.insert();
    action.setRedirectURL(saveMe);
}
