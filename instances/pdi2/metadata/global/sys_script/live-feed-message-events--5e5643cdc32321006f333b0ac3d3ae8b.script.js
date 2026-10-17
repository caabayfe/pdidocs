/**
Service-now.com
Description: Notification events for Feed messages for Live Feed 2.0
 **/

var live_feed_version = new LiveFeedUtil().getLiveFeedVersion();
if (live_feed_version == '2.0') {
	if (current.operation() == "insert")
		processLiveInsertEvents2();
}

function processLiveInsertEvents2() {
	var msgUtil = new LiveMsgUtil(current);

	//new message
	if (current.reply_to.nil()) {
		//only fire general event on public messages so notification subscribers wont get private messages
		if (!current.private_message)
			gs.eventQueue("live_message.inserted", current, current.getUniqueValue());

		//notify group subscribers
		if (!current.group.nil()) {
			if(current.to_profile.nil()) {
				var subscribers;
				if(isWorkNoteMessage(current))
					subscribers = new LiveFeedFeed().getConversationNotificationUsersById(current.group, true);
				else
					subscribers = new LiveFeedFeed().getConversationNotificationUsersById(current.group, false);
				if(subscribers.length > 0)
					gs.eventQueue("live_message.group_inserted", current, subscribers);
			}
			else {
				gs.eventQueue("live_message.group_inserted", current, current.to_profile.document);
			}
		}
	}

	//reply message
	else {
		// notify group subscribers
		if (!current.group.nil()) {
			if(current.to_profile.nil()) {
				var subscribers;
				if(isWorkNoteMessage(current))
					subscribers = new LiveFeedFeed().getConversationNotificationUsersById(current.group, true);
				else
					subscribers = new LiveFeedFeed().getConversationNotificationUsersById(current.group, false);

				var threadUsers = msgUtil.getThreadUsers(current);

				//merge subscribers and thread members and get unique array of users to notify
				var notifyList = new ArrayUtil().union(threadUsers, subscribers);

				if (notifyList.length > 0)
					gs.eventQueue("live_message.group_replied", current, notifyList);
			}
			else {
				gs.eventQueue("live_message.group_replied", current, current.to_profile.document);
			}
		}
		else {
			if(current.to_profile.nil()) {
				//notify thread members for non-group replies
				var threadUsers = msgUtil.getThreadUsers(current);
				if (threadUsers.length > 0)
					gs.eventQueue("live_message.replied", current, threadUsers);
			}
			else {
				gs.eventQueue("live_message.replied", current, current.to_profile.document);
			}
		}
	}

	//at Mentions
	if(current.to_profile.nil() && !isWorkNoteMessage(current) && !isChatMessage(current)) {
		processMentionEvents(current.message);
	}
}

function processMentionEvents(message) {
	var l = /@\[([a-z0-9]{32}):([^:\[\]]+)\]/g;
	var match;
	var mentionMembers = {};
	while(match = l.exec(message)) {
		mr = new GlideRecord('live_profile');
		mr.addQuery('sys_id',match[1]);
		mr.query();
		while(mr.next()) {
			if(mr.getValue('table') == 'sys_user')
				mentionMembers[mr.document] = 1;
			else if(mr.getValue('table') == 'live_group_profile') {
				var params = {team: mr.document, state: ['active','admin']};
				var lft = new LiveFeedTeam().getMembers(params);
				lft.query();
				while(lft.next())
					mentionMembers[lft.member.document] = 1;
			}
		}
	}
	var unique_members = [];
	for(var key in mentionMembers)
		unique_members.push(key);
	gs.eventQueue("live_message.mentioned", current, unique_members);

}

function isChatMessage(current) {
	return current.chat_message;
}

function isWorkNoteMessage(current) {
	return (!current.group.nil() && (current.reflected_field == 'work_notes' || current.reply_to.reflected_field == 'work-notes'));
}
