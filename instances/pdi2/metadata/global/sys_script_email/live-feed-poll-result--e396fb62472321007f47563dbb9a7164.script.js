var option = new GlideRecord('live_poll_option');
option.addQuery('poll', current.sys_id);
option.orderBy('order');
option.query();
template.print('<p><span style="font-size: 14pt;">Result</span></p>');
while(option.next()) {
	template.print('<b>' + option.name + '</b>: ');
	template.print((option.cast_count * 100/current.cast_count).toFixed(1) + '% (' + option.cast_count + ' vote(s))');
	template.print('<br/>');
}
template.print('<br/>');
var msg = new GlideRecord('live_message');
msg.addQuery('poll', current.sys_id);
msg.query();
if(msg.next()){
	template.print('<a href="/nav_to.do?uri=live_feed_launcher.do?sysparm_feed_type=msg_feed%26sysparm_msg_id=' + msg.sys_id + '">View Poll</a>');
}
