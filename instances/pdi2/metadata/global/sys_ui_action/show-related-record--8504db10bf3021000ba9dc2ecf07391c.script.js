var gr = new GlideRecord(current.sys_class_name);
gr.get(current.sys_id);
action.setRedirectURL(gr);
action.setReturnURL("sys_metadata.do?sysparm_ignore_class=true&sys_id=" + current.sys_id.toString());
