function shouldAllowForPersonalAccessToken() {
	var transaction = GlideTransaction.get();
	if (transaction.getRequestParameter("oauth_personal") != "true")
		return false;

	if (transaction.getRequestParameter("oauth_requestor_context") != "oauth_2_0_credentials")
		return false;

	var credentialSysId = transaction.getRequestParameter("oauth_requestor");
	if (!credentialSysId)
		return false;

	var gr = new GlideRecord("oauth_2_0_credentials");
	if (!gr.get(credentialSysId))
		return false;

	if (gr.getValue("integration_type") != "personal")
		return false;

	return true;
}

answer = shouldAllowForPersonalAccessToken();
