/**
Service-now.com
Description: Notification events for live messages
 **/

var live_feed_version = new LiveFeedUtil().getLiveFeedVersion();
if (live_feed_version == '1.0') {
	if (current.operation() == "insert")
		processLiveInsertEvents();
}

function processLiveInsertEvents() {
	var msgUtil = new LiveMsgUtil(current);

	//new message
	if (current.reply_to.nil()) {
		//only fire general event on public messages so notification subscribers wont get private messages
		if (!current.private_message)
			gs.eventQueue("live_message.inserted", current, current.getUniqueValue());

		//notify group subscribers
		if (!current.group.nil()) {
			if(current.to_profile.nil()) {
				var subscribers = new LiveFeedUtil().getGroupNotificationUsers(current.group);
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
				var subscribers = new LiveFeedUtil().getGroupNotificationUsers(current.group);
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
}
