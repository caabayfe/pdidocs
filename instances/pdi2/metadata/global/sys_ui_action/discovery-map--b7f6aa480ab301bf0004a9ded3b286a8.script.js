var url = "generic_hierarchy.do";
url += "?sysparm_stack=no";
url += "&sysparm_attributes=record=ecc_queue";
url += ",parent=response_to";
url += ",title=topic";
url += ",description=source";
url += ",baseid=";
url += current.sys_id;
gs.setRedirect(url);
