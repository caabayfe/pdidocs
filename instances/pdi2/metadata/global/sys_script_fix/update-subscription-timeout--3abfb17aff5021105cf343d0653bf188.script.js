var subscription = new GlideRecord('sys_kafka_subscription');
subscription.query();

while (subscription.next()) {
    subscription.setValue('partition_group_timeout', GlideProperties.get('glide.ih.kafka.consumer.max_seconds_per_partition_group', 10) * 1000);
    subscription.update();
}
