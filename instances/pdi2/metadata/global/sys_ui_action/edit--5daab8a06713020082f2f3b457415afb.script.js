var uri = action.getGlideURI();
var path = uri.getFileFromPath();
uri.set('sysparm_m2m_ref', current.getTableName());
uri.set('sysparm_stack', 'no');

// get domain of current process
var procId = uri.get("sysparm_collectionID");
var grProc = new GlideRecord("pwd_process");
grProc.get(procId);

uri.set("sysparm_domain", grProc.sys_domain);

action.setRedirectURL(uri.toString('sys_m2m_template.do'));
