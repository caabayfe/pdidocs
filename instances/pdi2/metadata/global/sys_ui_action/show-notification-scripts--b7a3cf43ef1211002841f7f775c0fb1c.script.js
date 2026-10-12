var message = "";
if (current.sys_version == 2)
	message = current.message_html;
else
	message = current.message;

message = message + "";
var mail_scripts = message.match(/\$\{mail_script:.*?\}/g);
if (mail_scripts) {
	var mailScriptNames = "";
	for (var i = 0; i < mail_scripts.length; i++) {
		if (i == 0)
			mailScriptNames += mail_scripts[i].substring(14,mail_scripts[i].length -1);
		else 
			mailScriptNames += "," + mail_scripts[i].substring(14,mail_scripts[i].length -1);
	}
	
	action.setRedirectURL("sys_script_email_list.do?sysparm_query=nameIN" + mailScriptNames);
} else
	action.setRedirectURL("sys_script_email_list.do?");
	
