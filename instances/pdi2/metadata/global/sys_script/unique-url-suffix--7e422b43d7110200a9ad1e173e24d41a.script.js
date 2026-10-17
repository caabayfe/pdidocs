(function executeRule(current, previous /*undefined when async or display*/) {

	var sites = new GlideRecord("content_site");
	if (!sites.isValid())
		return;
	
	sites.setWorkflow(false);
	if (!sites.get("url_suffix", current.url_suffix))
		return;
	
	current.setAbortAction(true);
	gs.addErrorMessage("URL suffix already used by CMS, choose another");

})(current, typeof previous != 'undefined' ?  previous : null);
