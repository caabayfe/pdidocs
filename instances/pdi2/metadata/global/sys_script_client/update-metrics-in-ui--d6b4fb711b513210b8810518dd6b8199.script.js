function onLoad() {
    var fields = ['consume_5min_avg', 'consume_1hr_avg', 'consume_1day_avg', 'produce_5min_avg', 'produce_1hr_avg', 'produce_1day_avg', 'msg_lag_5min_avg', 'msg_lag_1hr_avg', 'msg_lag_1day_avg'];

    for (var i = 0; i < fields.length; i++) {
        var value = g_scratchpad["subscription"][fields[i]];
        g_form.setValue(fields[i], truncate(value, 4));
    }

    g_form.setValue('estimated_time_to_process_the_current_queue', g_scratchpad["subscription"]['estimated_time_to_process_the_current_queue']);
    g_form.setValue('display_max_batch_size', g_scratchpad["subscription"]['display_max_batch_size']);

    function truncate(num, exp) {
        return Math.trunc(num * Math.pow(10, exp)) / Math.pow(10, exp);
    }
}
