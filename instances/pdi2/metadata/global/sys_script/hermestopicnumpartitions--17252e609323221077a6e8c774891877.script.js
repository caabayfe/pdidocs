(function executeRule(current, previous /*null when async*/) {
	var gURI = "";
    try {
        gURI = gs.action.getGlideURI();
    } catch (e) {
        return;
    }

	if (gURI.toString().indexOf("sys_kafka_topic_list.do") != -1) {
        var topicManager = new sn_hermes.HermesTopicManager();
        topicManager.totalUsedPartitionsMessage();
    }
})(current, previous);
