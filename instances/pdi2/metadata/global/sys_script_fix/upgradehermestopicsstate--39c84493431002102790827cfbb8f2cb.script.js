try {
    updateServiceId();
} catch (exception) {
    gs.info("Unable to update service id for hermes_topics_state: " + exception);
}

function updateServiceId() {
	var topicStateRecord = new GlideRecord('hermes_topics_state');
	topicStateRecord.query();
	while (topicStateRecord.next()) {
		topicStateRecord.setValue("service_id", "bfe548804320311041a0e8625ab8f242"); // hermes-internal service
		topicStateRecord.update();
	}
}
