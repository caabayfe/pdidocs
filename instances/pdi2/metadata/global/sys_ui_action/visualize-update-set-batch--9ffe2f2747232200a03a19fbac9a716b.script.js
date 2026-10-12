var url = "generic_hierarchy.do";
url += "?sysparm_stack=no";
url += "&sysparm_attributes=record=sys_remote_update_set,";
url += "parent=parent,";
url += "title=name,";
url += "description=description,";
url += "baseid=" + current.remote_base_update_set;

gs.setRedirect(url);
