(function executeRule(current, previous /*null when async*/) {

	if (current.isNewRecord()) {
		var parent = (current.parent_topic && current.parent_topic.toString()) || '';
		if (parent) {
			var parentTopic = current.parent_topic;
			current.available_for = parentTopic.available_for.toString();
			current.not_available_for = parentTopic.not_available_for.toString();
			current.enable_user_criteria_check = parentTopic.enable_user_criteria_check.toString();
			var parentTopicManager = parentTopic.topic_manager.toString();
			var parentTopicContributor = parentTopic.topic_contributor.toString();
			if (parentTopicManager !== current.topic_manager.toString()) {
				current.topic_manager = parentTopicManager;
			}
			if (parentTopicContributor !== current.topic_contributor.toString()) {
				current.topic_contributor = parentTopicContributor;
			}
		}
	}

})(current, previous);
