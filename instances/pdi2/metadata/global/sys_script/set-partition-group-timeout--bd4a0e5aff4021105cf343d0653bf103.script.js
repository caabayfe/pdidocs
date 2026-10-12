(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.partitionGroupTimeout = gs.getProperty('glide.ih.kafka.consumer.max_seconds_per_partition_group', 10);

})(current, previous);
