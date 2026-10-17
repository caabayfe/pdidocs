if (current.live_feed == true) {
	var gr = new GlideRecord("live_group_profile");
	gr.addQuery("document", current.source_id);
	gr.addQuery("table", current.source_table);
	gr.query();
	if (!gr.next()) {
		//Create a live feed group for this assessable record
		var gr_new = new GlideRecord("live_group_profile");
		gr_new.document = current.source_id;
		gr_new.table = current.source_table;
		gr_new.document_group = true;
		gr_new.name = current.name;
		gr_new.short_description = gs.getMessage("Conversation for assessable record '{0}'", current.name);
		gr_new.public_group = true;
		gr_new.visible_group = true;
		current.live_feed_group = gr_new.insert();
	} else {
		current.live_feed_group = gr.sys_id;
	}
} else if (current.operation() != 'insert' && current.live_feed == false){
	new LiveFeedUtil().deleteGroup(current.live_feed_group);
}
