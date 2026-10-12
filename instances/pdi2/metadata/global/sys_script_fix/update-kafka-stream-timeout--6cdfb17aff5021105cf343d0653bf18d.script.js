var kafkaStream = new GlideRecord('sys_kafka_stream');
kafkaStream.query();

var maxCapacity;
while (kafkaStream.next()) {
    maxCapacity = kafkaStream.getValue('max_concurrency') * GlideProperties.get('glide.ih.kafka.consumer.max_seconds_per_partition_group', 10);
    kafkaStream.setValue('max_capacity', maxCapacity);
    kafkaStream.update();
}
