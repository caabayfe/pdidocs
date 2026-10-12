(function executeRule(current, previous /*null when async*/ ) {

    var topicManager = new sn_hermes.HermesTopicManager();
    topicManager.createTopic(current);

})(current, previous);
