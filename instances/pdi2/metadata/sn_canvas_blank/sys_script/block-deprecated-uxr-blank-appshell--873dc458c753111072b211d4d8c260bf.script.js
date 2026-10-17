(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage('UXR Blank AppShell is deprecated. Please use UXR Base Experience Shell instead and a Parent App. See <a href="https://servicenow.sharepoint.com/sites/UXFramework/SitePages/AppShell-and-Experience-Shell-and-Parent-App.aspx" target="_blank">link</a> for details.'));
	current.setAbortAction(true);
})(current, previous);
