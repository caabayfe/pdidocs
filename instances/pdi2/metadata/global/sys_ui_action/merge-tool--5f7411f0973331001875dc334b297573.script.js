mergeTool();

function mergeTool() {
	var returnUrl = current;
	var url = action.getValues().get('sysparm_referring_url');
	if(url) returnUrl = url;

	action.setRedirectURL("merge_tool.do?sysparm_version_id=" + current.version);
	action.setReturnURL(returnUrl);
}
