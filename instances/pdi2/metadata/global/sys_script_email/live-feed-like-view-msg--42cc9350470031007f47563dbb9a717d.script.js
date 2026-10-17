template.print("<br />");
var url = "/nav_to.do?uri=live_feed_launcher.do?sysparm_feed_type=msg_feed%26sysparm_msg_id=";
if(current.message.reply_to)
	url = url + current.message.reply_to;
else
	url = url + current.message;
var htmlLink = '<a href="' + url + '">View Message</a>';
template.print(htmlLink);
