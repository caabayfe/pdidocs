template.print("<br />");
var url = "/nav_to.do?uri=live_feed_launcher.do?sysparm_feed_type=msg_feed%26sysparm_msg_id=";
if(current.reply_to)
	url = url + current.reply_to;
else
	url = url + current.sys_id;
var htmlLink = '<a href="' + url + '">View Message</a>';
template.print(htmlLink);
