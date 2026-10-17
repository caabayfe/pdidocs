(function executeRule(current, previous /*null when async*/ ) {

    var maxCapacityUpper = parseInt(gs.getProperty('com.glide.maximum_capacity_upper_limit', 2000));
    var maxCapacityLower = parseInt(gs.getProperty('com.glide.maximum_capacity_lower_limit', 5));
    var maxCapacity = parseInt(current.max_capacity);

    if (maxCapacity < maxCapacityLower) {
        gs.addErrorMessage("Invalid maximum capacity, please enter a number greater than or equal to " + maxCapacityLower);
        current.setAbortAction(true);
    } else if (maxCapacity > maxCapacityUpper) {
        gs.addErrorMessage("Invalid maximum capacity, please enter a number less than or equal to " + maxCapacityUpper);
        current.setAbortAction(true);
    } else {
        var subscription = new sn_ih_kafka.ETLConsumerSubscription();
        if (subscription.activate(current)) {
            gs.addInfoMessage(gs.getMessage('Refreshed the subscription'));
        }
    }

})(current, previous);
