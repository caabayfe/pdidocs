var url = 'wf_context.do?sysparm_query=id=' + current.sys_id.toString();
if (!current.context.nil())
   url = 'wf_context.do?sysparm_query=sys_id=' + current.context.toString();
action.setRedirectURL(url);
