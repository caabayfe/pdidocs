var gr = new GlideRecord('live_message_tag');
var gr2 = gr.addJoinQuery('live_message', 'message', 'sys_id');
gr2.addCondition('group', current.sys_id);
gr.query();

while (gr.next()) {
	var ga = new GlideRecord('live_tag');
	ga.addQuery('sys_id', gr.tag);
	ga.query();

	while (ga.next()) {
		var count = ga.count -1;
		ga.setValue('count', count);

		if (ga.count == 0)
			ga.deleteRecord();
		ga.update();
	}
	gr.deleteRecord();
	gr.update();
}


// Live Group Member - CASCADE
	var groupMember = new GlideMultipleUpdate('live_group_member');
	groupMember.addQuery('group', current.sys_id);
	groupMember.setValue('sys_domain', current.sys_domain);
	groupMember.execute();

// Live Group Favorite - CASCADE
	var grpFav = new GlideMultipleUpdate('live_favorite');
	grpFav.addQuery('table', 'live_group_profile');
	grpFav.addQuery('document', current.sys_id);
	grpFav.setValue('sys_domain', current.sys_domain);
	grpFav.execute();

 //live_message - CASCADE

	var tagProcessor = new GlideappMessageTag();

	var msg = new GlideRecord('live_message');
	msg.addQuery('group', current.sys_id);
	msg.query();
	var msgTag, like, link, mention, favorite, poll, poll_option, poll_cast, att, thumb;
	while (msg.next()) {
		msg.sys_domain = current.sys_domain;
		msg.update();

		tagProcessor.processTags(msg);

		// Live Message Tag - CASCADE
		msgTag = new GlideMultipleUpdate('live_message_tag');
		msgTag.addQuery('message', msg.sys_id);
		msgTag.setValue('sys_domain', current.sys_domain);
		msgTag.execute();

		// Live Message Like - CASCADE
		like = new GlideMultipleUpdate('live_message_like');
		like.addQuery('message', msg.sys_id);
		like.setValue('sys_domain', current.sys_domain);
		like.execute();

		// Live Link - CASCADE
		link = new GlideMultipleUpdate('live_link');
		link.addQuery('attached_to_id', msg.sys_id);
		link.setValue('sys_domain', current.sys_domain);
		link.execute();
		
		// Live Mention - CASCADE
		mention = new GlideMultipleUpdate('live_mention');
		mention.addQuery('message', msg.sys_id);
		mention.setValue('sys_domain', current.sys_domain);
		mention.execute();
		
		//Live Favorite
		favorite = new GlideMultipleUpdate('live_favorite');
		favorite.addQuery('table', 'live_message');
		favorite.addQuery('document', msg.sys_id);
		favorite.setValue('sys_domain', current.sys_domain);
		favorite.execute();
		
		//Live Poll
		if(msg.poll) {
			poll = new GlideRecord('live_poll');
			poll.get(msg.poll);
			poll.setValue('sys_domain', current.sys_domain);
			poll.update();
			
			poll_option = new GlideMultipleUpdate('live_poll_option');
			poll_option.addQuery('poll', msg.poll);
			poll_option.setValue('sys_domain', current.sys_domain);
			poll_option.execute();
			
			poll_cast = new GlideMultipleUpdate('live_poll_cast');
			poll_cast.addQuery('poll', msg.poll);
			poll_cast.setValue('sys_domain', current.sys_domain);
			poll_cast.execute();
		}
		// File Attachment - CASCADE
		// attached file
		att = new GlideRecord('sys_attachment');
		att.addQuery('table_sys_id', msg.sys_id);
		att.query();
		while (att.next()) {
			att.sys_domain = current.sys_domain;
			att.update();

			// thumbnail version of the attached file
			thumb = new GlideRecord('sys_attachment');
			thumb.addNullQuery('table_sys_id');
			thumb.addQuery('file_name', "thumb_" + att.sys_id + ".jpg");
			thumb.query();
			if (thumb.next()) {
				thumb.sys_domain = current.sys_domain;
				thumb.update();
			}
		}
	}
