(function executeFixScript() {

    var subscriptionFields = ['consume_5min_avg', 'consume_1hr_avg', 'consume_1day_avg', 'produce_5min_avg', 'produce_1hr_avg', 'produce_1day_avg', 'msg_lag_5min_avg', 'msg_lag_1hr_avg', 'msg_lag_1day_avg', 'estimated_time_to_process_the_current_queue', 'display_max_batch_size'];

    var partitionGroupFields = ['consume_5min_avg', 'consume_1hr_avg', 'consume_1day_avg', 'produce_5min_avg', 'produce_1hr_avg', 'produce_1day_avg', 'msg_lag_5min_avg', 'msg_lag_1hr_avg', 'msg_lag_1day_avg'];

    updateCalculatedFieldsToReadOnly("sys_kafka_subscription", subscriptionFields);
    updateCalculatedFieldsToReadOnly("sys_kafka_partition_group", partitionGroupFields);


    function updateCalculatedFieldsToReadOnly(table, fields) {
        var gr = new GlideRecord("sys_dictionary");
        gr.addQuery("name", table);
        gr.addQuery("element", "IN", fields.join(","));
        gr.query();
        while (gr.next()) {
            gr.setValue("virtual", "false");
            gr.setValue("calculation", "");
            gr.setValue("read_only", "true");
            gr.setValue("read_only_option", "client_script_modifiable");
            gr.update();
        }
    }
})();
