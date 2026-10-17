/**
 Service-now.com
 
 Description: Notification event when member state changes
 **/
if (current.group.type == "group")
	processLiveFeedFeedMemberUpdateEvents();
else if(current.group.type == "team")
	processLiveFeedTeamMemberUpdateEvents();


function processLiveFeedFeedMemberUpdateEvents(){
    // only concern with members who are users
    if (current.member.type != "user")
       return;

	var lfu = new LiveFeedUtil();
	// get a list of all the admins of this Feed
    var admins = lfu.getGroupAdminUsers(current.group);

    // let admins know that member declined invitation
    if (previous.state == 'invited' && current.state == 'inactive')
       gs.eventQueue("live_feed.feed_member.declined", current, admins, current.member.name);

    // let admins know that member accepted invitation
    if (previous.state == 'invited' && current.state == 'active')
       gs.eventQueue("live_feed.feed_member.accepted", current, admins, current.member.name);

    if (previous.state == 'active' && current.state == 'inactive') {
		if(lfu.isSessionAdmin(current.group))//Admin removed the user from Feed
			gs.eventQueue("live_feed.feed_member.removed", current, current.member.document, gs.getUserDisplayName());
		else //User has left the Feed
			gs.eventQueue("live_feed.feed_member.left", current, admins, current.member.name);
	}

    // let member know that they were invited by this session's user to join the Feed
    if (previous.state != 'invited' && current.state == 'invited') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.feed_member.invited", current, userId, gs.getUserDisplayName());
    }

    // let member know that they were rejected from the Feed
    if (previous.state == 'request' && current.state == 'inactive') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.feed_member.rejected", current, userId);
    }

    // let member know that they were accepted to the Feed
    if (previous.state == 'request' && current.state == 'active') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.feed_member.request_accepted", current, userId);
    }

    // let admins know that user is requesting to join
    if (previous.state != 'request' && current.state == 'request')
       gs.eventQueue("live_feed.feed_member.request", current, admins, current.member.name);
}

function processLiveFeedTeamMemberUpdateEvents() {
	// only concern with members who are users
    if (current.member.type != "user")
       return;

	var lfu = new LiveFeedUtil();
	// get a list of all the admins of this group
    var admins = lfu.getGroupAdminUsers(current.group);

    // let admins know that member declined invitation
    if (previous.state == 'invited' && current.state == 'inactive')
       gs.eventQueue("live_feed.team_member.declined", current, admins, current.member.name);

    // let admins know that member accepted invitation
    if (previous.state == 'invited' && current.state == 'active')
       gs.eventQueue("live_feed.team_member.accepted", current, admins, current.member.name);

    // User is no longer part of the group
    if (previous.state == 'active' && current.state == 'inactive') {
		if(lfu.isSessionAdmin(current.group))
			gs.eventQueue("live_feed.team_member.removed", current, current.member.document, gs.getUserDisplayName());
		else
			gs.eventQueue("live_feed.team_member.left", current, admins, current.member.name);
	}

    // let member know that they were invited by this session's user to join the group
    if (previous.state != 'invited' && current.state == 'invited') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.team_member.invited", current, userId, gs.getUserDisplayName());
    }

    // let member know that they were rejected from joining the group
    if (previous.state == 'request' && current.state == 'inactive') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.team_member.rejected", current, userId);
    }

    // let member know that they were accepted to the group
    if (previous.state == 'request' && current.state == 'active') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.team_member.request_accepted", current, userId);
    }

    // let admins know that user is requesting to join
    if (previous.state != 'request' && current.state == 'request')
       gs.eventQueue("live_feed.team_member.request", current, admins, current.member.name);
}
