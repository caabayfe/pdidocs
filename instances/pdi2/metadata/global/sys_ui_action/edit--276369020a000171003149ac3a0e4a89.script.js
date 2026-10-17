var DH = new DiffHelper();
var url = DH.getURL(current.update_xml.sys_id);
gs.setRedirect(url + "&sysparm_stack=sys_update_diff.do?sys_id=" + current.sys_id);
