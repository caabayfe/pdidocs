var name = "Scheduled Generation based on " + current.name.toString();
name = Packages.java.net.URLEncoder.encode(name);
var query = "template=" + current.sys_id + "^name=" + name;
var redirect = "sysauto_template.do?sys_id=-1&sysparm_query=" + query;
action.setRedirectURL(redirect);
