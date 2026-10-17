var hasLiveFeed = false;
var gr = new GlideRecord("live_group_profile");
if (gr.isValid()) {
	gr.addQuery("document", current.source_id);
	gr.addQuery("table", current.source_table);
	gr.query();
	hasLiveFeed = gr.next();
}
if (current.live_feed == false) {
	if (hasLiveFeed && GlideStringUtil.notNil(current.source_id)) {
		current.live_feed = true;
		current.live_feed_group = gr;
		current.update();
	}
} else {
	if (!hasLiveFeed) {
		current.live_feed = false;
		current.live_feed_group = "";
		current.update();
	}
}
