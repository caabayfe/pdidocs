/**
 Service-now.com
 
 Description: Notification events when new members are added
 **/
if (current.group.type == "group")
	processLiveFeedFeedMemberInsertEvents();
else if(current.group.type == "team")
	processLiveFeedTeamMemberInsertEvents();

function processLiveFeedFeedMemberInsertEvents() {
   // only concern with members who are users
   if (current.member.type != "user")
      return;

    // parm1 was invited by parm2
    if (current.state == 'invited') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.feed_member.invited", current, userId, gs.getUserDisplayName());
    }

    // let parm1 know that parm2 is requesting to join
    if (current.state == 'request') {
       // get a list of all the admins of this feed
       var admins = new LiveFeedUtil().getGroupAdminUsers(current.group);
       gs.eventQueue("live_feed.feed_member.request", current, admins, current.member.name);
    }
}

function processLiveFeedTeamMemberInsertEvents() {
	// only concern with members who are users
    if (current.member.type != "user")
      return;

    // parm1 was invited by parm2
    if (current.state == 'invited') {
       var userId = current.member.document;
       gs.eventQueue("live_feed.team_member.invited", current, userId, gs.getUserDisplayName());
    }

    // let parm1 know that parm2 is requesting to join
    if (current.state == 'request') {
       // get a list of all the admins of this group
       var admins = new LiveFeedUtil().getGroupAdminUsers(current.group);
       gs.eventQueue("live_feed.team_member.request", current, admins, current.member.name);
    }
}
