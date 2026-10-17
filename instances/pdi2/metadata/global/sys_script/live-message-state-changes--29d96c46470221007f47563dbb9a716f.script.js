//tags and their counts
new LiveFeedTag().onMessageStateChange(current);

if(current.state !== 'deleted') {
	//@mentions
	var mentionRegx = /@\[([a-z0-9]{32}):([^:\[\]]+)\]/g;
	var gr = new GlideRecord('live_mention');
	current.message.replace(mentionRegx, function(fullmatch, grp1){
		gr.initialize();
		gr.message = current.sys_id;
		gr.mention = grp1;
		gr.sys_domain_id = current.sys_domain_id;
		gr.insert();
	});
}
