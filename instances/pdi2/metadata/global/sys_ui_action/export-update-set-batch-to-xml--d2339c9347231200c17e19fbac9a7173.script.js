var updateSetExport = new UpdateSetExport();
var sysid = updateSetExport.exportHierarchy(current);

action.setRedirectURL("export_base_update_set.do?sysparm_sys_id=" + sysid + "&sysparm_delete_when_done=true&sysparm_is_remote=false&sysparm_ck=" + gs.getSessionToken());
