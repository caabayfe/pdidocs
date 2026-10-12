(function executeRule(current, previous /*null when async*/ ) {

    var stats = new IHKafkaStats();
    var subscriptionField = 'subscription';

    var consume_5min_avg = stats.getConsumeAverage('javascript:gs.minutesAgo(5)', current.getUniqueValue(), subscriptionField);
    var consume_1hr_avg = stats.getConsumeAverage('javascript:gs.hoursAgo(1)', current.getUniqueValue(), subscriptionField);
    var consume_1day_avg = stats.getConsumeAverage('javascript:gs.hoursAgo(24)', current.getUniqueValue(), subscriptionField);

    var produce_5min_avg = stats.getProduceAverage('javascript:gs.minutesAgo(5)', current.getUniqueValue(), subscriptionField);
    var produce_1hr_avg = stats.getProduceAverage('javascript:gs.hoursAgo(1)', current.getUniqueValue(), subscriptionField);
    var produce_1day_avg = stats.getProduceAverage('javascript:gs.hoursAgo(24)', current.getUniqueValue(), subscriptionField);

    var msg_lag_5min_avg = stats.getQueueAverage('javascript:gs.minutesAgo(5)', current.getUniqueValue(), subscriptionField);
    var msg_lag_1hr_avg = stats.getQueueAverage('javascript:gs.hoursAgo(1)', current.getUniqueValue(), subscriptionField);
    var msg_lag_1day_avg = stats.getQueueAverage('javascript:gs.hoursAgo(24)', current.getUniqueValue(), subscriptionField);

    var estimated_time_to_process_the_current_queue = stats.getEstimatedQueueDepthTime('javascript:gs.minutesAgo(5)', current.getUniqueValue(), subscriptionField);

    var displayBatchSize = current.getValue('max_batch_size');
    var display_max_batch_size = displayBatchSize == '0' ? 'automatically optimized' : displayBatchSize;


    g_scratchpad.subscription = {
        consume_5min_avg,
        consume_1hr_avg,
        consume_1day_avg,
        produce_5min_avg,
        produce_1hr_avg,
        produce_1day_avg,
        msg_lag_5min_avg,
        msg_lag_1hr_avg,
        msg_lag_1day_avg,
        estimated_time_to_process_the_current_queue,
        display_max_batch_size
    };
})(current, previous);
