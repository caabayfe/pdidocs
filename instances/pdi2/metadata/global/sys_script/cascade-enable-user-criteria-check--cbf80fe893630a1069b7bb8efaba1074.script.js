(function executeRule(current, previous /*null when async*/ ) {

		if (!current.isNewRecord() && current.taxonomy == previous.taxonomy) {
			if (current.parent_topic == previous.parent_topic) { // to handle the scenario where an existing root topic's metadata is changed but hierarchy remains the same
				cascadeUC(current, previous);
			} else {
				if (current.enable_user_criteria_check) {
					if (current.parent_topic == '') {
						current.available_for = previous.available_for.toString();
						current.not_available_for = previous.not_available_for.toString();
					} else {
						cascadeUC(current, previous);
					}
				}
			}
		}
})(current, previous);

function cascadeUC(current, previous) { // reference is passed into callback as first arguments
    var topicPermissionUtil = new TopicPermissionUtil();

    if (current.available_for.toString() !== previous.available_for.toString()) {
        topicPermissionUtil.applyCascadeForAvailableFor(current, previous);
    }

    if (current.not_available_for.toString() !== previous.not_available_for.toString()) {
        topicPermissionUtil.applyCascadeForNotAvailableFor(current, previous);
    }

    if (current.enable_user_criteria_check.toString() !== previous.enable_user_criteria_check.toString()) {
        new global.TopicList().updateChildTopics(current);
    }
}
