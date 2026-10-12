function updateTopicType(table) {
    var gr = new GlideRecord(table);
	gr.addNullQuery("type");
    gr.query();
    while (gr.next()) {
		if (gr.library) {
			gr.type = "TOPIC_BLOCK";
		}
		else{
			gr.type = "STANDARD";
		}
		gr.update();
    }
}

updateTopicType("sys_cb_topic");
updateTopicType("sys_cs_topic");
