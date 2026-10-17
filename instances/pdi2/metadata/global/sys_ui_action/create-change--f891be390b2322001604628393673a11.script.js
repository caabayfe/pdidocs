var url = new GlideURL("change_request.do");
url.set("sys_id" , "-1");
url.set("sysparm_query" , "^parent=" + current.sys_id);
action.setRedirectURL(url.toString()+"");
