resetRule();
function resetRule(){
	new RESTRateLimitCommon().resetRateLimitRule(current.getUniqueValue());
	action.setRedirectURL(current);
}
