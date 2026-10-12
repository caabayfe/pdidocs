(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var translatedErr = "";
    var topicManager = new sn_hermes.HermesTopicManager();
    var topic = new GlideRecord('sys_kafka_topic');
    topic.addQuery("sys_id", current.topic_name.toString());
	topic.addQuery("active", true); //topic may exist in sys_kafka_topic, but not the clusters
    topic.query();
    if (topic.next()) {
        if (current.property_name == previous.property_name) { //update existing
            topicManager.updateTopicConfig(current, topic, current.property_name, current.property_value);
        } else {
            //check property_name doesn't already exist
            var config = GlideRecord("kafka_topic_override_configuration");
            config.addQuery("topic_name", topic.getValue("sys_id"));
            config.addQuery("property_name", current.property_name);
            config.query();
            if (config.next()) {
                translatedErr = sn_i18n.Message.getMessage("HERMES_TOPIC_CONFIG_UPDATE", "Provided property name already exists");

                gs.addErrorMessage(translatedErr);
                current.setAbortAction(true);
                return;

            } else {
                topicManager.updateTopicConfig(current, topic, current.property_name, current.property_value);
            }
        }
    } else {
        translatedErr = sn_i18n.Message.getMessage("HERMES_TOPIC_CONFIG_UPDATE", "Provided property name already exists OR selected topic is inactive");

        gs.addErrorMessage(translatedErr);
        current.setAbortAction(true);
        return;

    }

})(current, previous);
