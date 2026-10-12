var fromFileView = current.getTableName() == "sys_metadata";
var returnUrl = fromFileView ? "sys_metadata.do?sysparm_ignore_class=true&sys_id=" + current.sys_id.toString() : current;
var url = action.getValues().get('sysparm_referring_url');
if(url)
	returnUrl = url;
var gr = new GlideRecord('sys_update_xml');
gr.addQuery('name', current.sys_update_name);
gr.orderByDesc('sys_updated_on');
gr.query();
if (!gr.next()) {
	gs.addInfoMessage(gs.getMessage("No update yet exists for this file"));
	action.setRedirectURL(current);
} else {
	action.setRedirectURL(gr);
	action.setReturnURL(returnUrl);
}
