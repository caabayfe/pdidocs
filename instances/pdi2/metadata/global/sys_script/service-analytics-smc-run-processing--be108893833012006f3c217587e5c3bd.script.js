(function executeRule(current, previous /*null when async*/) {

    // Add your code here
    var serviceProcessor = new SNC.ServiceAnalyticsProcessor();
    serviceProcessor.rcaLearnForService(current.config_a_id, current.service_id, false);
    serviceProcessor.rcaLearnForService(current.config_b_id, current.service_id, false);

})(current, previous);
