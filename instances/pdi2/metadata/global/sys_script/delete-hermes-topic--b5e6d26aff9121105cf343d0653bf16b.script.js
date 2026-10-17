(function executeRule(current, previous /*null when async*/ ) {

    var topicManager = new sn_hermes.HermesTopicManager();
    if (!topicManager.deleteTopic(current)) {
        current.setAbortAction(true);
		gs.setRedirect("sys_kafka_topic.do?sys_id=" + current.sys_id);
    }

})(current, previous);
