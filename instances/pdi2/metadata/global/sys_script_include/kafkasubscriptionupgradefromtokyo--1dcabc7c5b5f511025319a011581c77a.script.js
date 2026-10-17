var KafkaSubscriptionUpgradeFromTokyo = Class.create();
KafkaSubscriptionUpgradeFromTokyo.prototype = {
    initialize: function() {},

    performUpgrade: function() {
        var topicRecords = {};
        var topicsCreated = 0;
        var subscriptionsUpdated = 0;
        var gr = new GlideRecord('sys_kafka_subscription');
        gr.addNullQuery("topic_ref");
        gr.addNotNullQuery("topic");
        gr.query();
        var topicManager = new sn_hermes.HermesTopicTableManager();
        while (gr.next()) {
            var topic = gr.topic.toString();

            // Be extra sure that only legacy topics are considered
            if (topic.length >= 4) {
                var prefix = topic.substring(0, 4);
                if (prefix == "snc." || prefix == "sni.")
                    continue;
            }

            // Create a sys_kafka_topic record
            var topicSysId = topicRecords[topic];
            if (!topicSysId) {
                topicSysId = topicManager.createTopicRecord(topic);
                topicsCreated++;
                topicRecords[topic] = topicSysId;
            }

            gr.topic = 'snc.' + topic;
            gr.topic_ref = topicSysId;
            if (!gr.update())
                gs.log("Unable to update sys_kafka_subscription with updated topic " + gr.topic + ":" + gr.topic_ref);
            else
                subscriptionsUpdated++;
        }
        gs.log('Attempted to create ' + topicsCreated + ' topics and update ' + subscriptionsUpdated + ' subscriptions from Tokyo or earlier format');
        this.scanTopics();
    },

    scanTopics: function() {
        var hermesTopics = new GlideRecord('hermes_topics_state');
        hermesTopics.query();
        var topicManager = new sn_hermes.HermesTopicTableManager();
        while (hermesTopics.next()) {
            topicManager.createTopicRecord(hermesTopics.topic_name);
        }
    },

    type: 'KafkaSubscriptionUpgradeFromTokyo'
};
