var url = new GlideURL("incident.do");
url.set("sys_id" , "-1");
if(current.requested_for) 
	url.set("sysparm_query" , "caller_id=" + current.requested_for + "^parent=" + current.sys_id);
else
	url.set("sysparm_query" , "caller_id=" + current.request.requested_for + "^parent=" + current.sys_id);

action.setRedirectURL(url.toString()+"");
