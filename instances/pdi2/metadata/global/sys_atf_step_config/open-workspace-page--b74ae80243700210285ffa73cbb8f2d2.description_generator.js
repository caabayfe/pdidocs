function generateDescription() {
    var workspaceUrl = step.inputs.workspace_page_url;
    var description = gs.getMessage("Navigate to Workspace URL: {0}", workspaceUrl);
	return description;
}
 generateDescription();
