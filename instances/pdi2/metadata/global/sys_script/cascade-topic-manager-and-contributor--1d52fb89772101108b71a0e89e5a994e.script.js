(function executeRule(current, previous /*null when async*/) {
	var topicPermissionUtil = new TopicPermissionUtil();

	if (current.topic_manager.toString() !== previous.topic_manager.toString()) {
		topicPermissionUtil.applyCascadeForTopicManager(current, previous);
	}

	if (current.topic_contributor.toString() !== previous.topic_contributor.toString()) {
		topicPermissionUtil.applyCascadeForTopicContributor(current, previous);
	}

})(current, previous);
