var lfFeed = new LiveFeedFeed();
lfFeed.deleteMessageLike(current.sys_id);

var favorite = new LiveFeedFavorite();
favorite.deleteFavorites('live_message', current.sys_id);

if(current.poll) {
	var poll = new LiveFeedPoll();
	poll.deletePoll(current.poll)
}

var mention = new GlideRecord('live_mention');
mention.addQuery('message', current.sys_id);
mention.query();
mention.deleteMultiple();

var live_tag = new GlideRecord('live_message_tag');
live_tag.addQuery('message', current.sys_id);
live_tag.query();
var lfTag = new LiveFeedTag();
while(live_tag.next()) {
	lfTag.removeMessageTag(current.sys_id, live_tag.tag);
}
