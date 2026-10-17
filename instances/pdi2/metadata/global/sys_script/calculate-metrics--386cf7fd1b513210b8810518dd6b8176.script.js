(function executeRule(current, previous /*null when async*/ ) {
    var stats = new IHKafkaStats();
    var partitionGroupField = 'partition_group';
    var consume_5min_avg = stats.getConsumeAverage('javascript:gs.minutesAgo(5)', current.getUniqueValue(), partitionGroupField);
    var consume_1hr_avg = stats.getConsumeAverage('javascript:gs.hoursAgo(1)', current.getUniqueValue(), partitionGroupField);
    var consume_1day_avg = stats.getConsumeAverage('javascript:gs.hoursAgo(24)', current.getUniqueValue(), partitionGroupField);

    var produce_5min_avg = stats.getProduceAverage('javascript:gs.minutesAgo(5)', current.getUniqueValue(), partitionGroupField);
    var produce_1hr_avg = stats.getProduceAverage('javascript:gs.hoursAgo(1)', current.getUniqueValue(), partitionGroupField);
    var produce_1day_avg = stats.getProduceAverage('javascript:gs.hoursAgo(24)', current.getUniqueValue(), partitionGroupField);

    var msg_lag_5min_avg = stats.getQueueAverage('javascript:gs.minutesAgo(5)', current.getUniqueValue(), partitionGroupField);
    var msg_lag_1hr_avg = stats.getQueueAverage('javascript:gs.hoursAgo(1)', current.getUniqueValue(), partitionGroupField);
    var msg_lag_1day_avg = stats.getQueueAverage('javascript:gs.hoursAgo(24)', current.getUniqueValue(), partitionGroupField);

    g_scratchpad.partition_group = {
        consume_5min_avg,
        consume_1hr_avg,
        consume_1day_avg,
        produce_5min_avg,
        produce_1hr_avg,
        produce_1day_avg,
        msg_lag_5min_avg,
        msg_lag_1hr_avg,
        msg_lag_1day_avg
    };

})(current, previous);
