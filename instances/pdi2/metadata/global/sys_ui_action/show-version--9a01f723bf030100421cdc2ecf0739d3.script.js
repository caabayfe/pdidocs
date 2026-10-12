var returnUrl = current;
var url = action.getValues().get('sysparm_referring_url');
if(url)
	returnUrl = url;

var versionRecord = new GlideRecord('sys_update_version');
if(versionRecord.get(current.version.toString())) {
	action.setRedirectURL(versionRecord);
	action.setReturnURL(returnUrl);
}
else {
	gs.addInfoMessage(gs.getMessage("Record not found"));
	action.setRedirectURL(returnUrl);
}
