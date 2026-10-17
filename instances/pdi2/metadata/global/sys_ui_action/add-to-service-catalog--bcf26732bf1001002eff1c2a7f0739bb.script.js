var uri = action.getGlideURI();
var refUrl = uri.get("sysparm_referring_url");
if (!refUrl)
	refUrl = "sys_db_object.do?sys_id=" + current.sys_id;

var url = "slushbucket_create_record_producer.do?sysparm_form=record_producer&sysparm_list=" + current.name
url += "&sysparm_stack=no&sysparm_referring_url=" + refUrl;
action.setRedirectURL(url);
