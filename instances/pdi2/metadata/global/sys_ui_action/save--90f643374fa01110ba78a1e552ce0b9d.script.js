var returnUrl = current;
if (current.getTableName() == "sys_metadata")
    returnUrl = "sys_metadata.do?sysparm_ignore_class=true&sys_id=" + current.sys_id.toString();
action.setRedirectURL(returnUrl);
current.update();
if (!current.isActionAborted())
    action.setRedirectURL(returnUrl);
