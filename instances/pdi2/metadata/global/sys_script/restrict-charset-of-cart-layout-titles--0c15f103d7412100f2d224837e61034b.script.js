/**
 * ServiceNow
 *
 * Description:  The idea of this script is to prevent anything apart from space, A-Z, a-Z,
 *               0-9,_ and - being used for layout titles.
 **/
var pattern=/^(sys_popup,|)[A-Za-z0-9_ ]+$/i;

if (!current.title.match(pattern)) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Service Catalog Layout title {0} can only contain spaces, A-Z, a-z, 0-9 and _", GlideStringUtil.escapeHTML(current.title)));
}
