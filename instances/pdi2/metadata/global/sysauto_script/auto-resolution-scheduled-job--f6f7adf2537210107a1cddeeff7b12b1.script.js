processContextErrors();

function processContextErrors() {
	var currentUserId = gs.getUserID();
	var gi = new GlideImpersonate();
	if (gs.nil(new AutoResolutionContextHelper()._getVAUserID())){
		gs.error('Error processing auto-resolution context errors because VA user ID is null');
		return;
	}
	
	gi.impersonate(new AutoResolutionContextHelper()._getVAUserID());

	try {
		var contextHelper = new AutoResolutionContextHelper();
		contextHelper.processContextErrorsOrTimeoutsOrClosedInteraction();
	} catch (err) {
		gs.error('Error processing auto-resolution context errors or timeouts: ' + err);
	} finally {
		gi.impersonate(currentUserId);
	}
}
