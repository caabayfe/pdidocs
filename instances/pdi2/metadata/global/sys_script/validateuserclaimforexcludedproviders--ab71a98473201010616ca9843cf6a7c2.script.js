(function executeRule(current, previous /*null when async*/) {

	// Get the Property 'glide.oauth.oidc.blacklisted_metadata_urls' and
	// check if the current URL is on exclusion list, if so prevent submitimg/updating the record.
	var excludedUrls = gs.getProperty('glide.oauth.oidc.blacklisted_metadata_urls');
	if (GlideStringUtil.notNil(excludedUrls) && excludedUrls.includes(current.oidc_url)) {
		gs.clearMessages();
		var errMsg = gs.getMessage("This 'OIDC Metadata URL' is on the exclusion list, the User claim or the User field for this Provider cannot be other than 'email'.");
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}
})(current, previous);
