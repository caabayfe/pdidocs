var liveProfileGR = new GlideRecord("live_profile");
liveProfileGR.addQuery("document", event.parm1);
liveProfileGR.query();
liveProfileGR.next()

var liveGroupMemberGR = new GlideRecord("live_group_member");
liveGroupMemberGR.addQuery("group", current.group);
liveGroupMemberGR.addQuery("member", liveProfileGR.getValue("sys_id"));
liveGroupMemberGR.query();
liveGroupMemberGR.next();

var messageTime = current.sys_created_on;
var last_viewed = liveGroupMemberGR.last_viewed;

answer = messageTime > last_viewed;
