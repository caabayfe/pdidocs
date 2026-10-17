(function executeRule(current, previous /*null when async*/) {
	let topics = new GlideRecord("mb_topic");
	topics.query();
	if (!topics.hasNext())
		return;

	gs.info("[MetricBase] Assigning topics to initial shard '" + current.shard_name + "'");
	let topic_list = [];
	while (topics.next()) {
		topic_list.push(topics.getUniqueValue());
	}
	current.setValue("topic", topic_list);
	if (current.update() == null) {
		gs.error("[MetricBase] Assigning topics failed: " + current.getLastErrorMessage());
	}
})(current, previous);
