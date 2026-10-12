var topics = new GlideRecord('sys_kafka_topic');
topics.query();
while (topics.next()) {
    topics.user_created = false;
	topics.update();
}
