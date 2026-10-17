(function executeRule(current, previous /*null when async*/ ) {

    var allowedKeysString = gs.getProperty('glide.analytics.bucket.allowed.customer.overrides.list', "HeartbeatInterval,SessionTimeout,MaxDataPointsPerHeartbeat");
    var allowedKeys = allowedKeysString.split(',').map(function(item) {
        return item.trim();
    });
    if (current.bucket_metadata_customer_override) {
        var parsedValue;
        try {
            parsedValue = JSON.parse(current.bucket_metadata_customer_override);
        } catch (e) {
            gs.addErrorMessage(gs.getMessage('Invalid JSON format'));
            current.setAbortAction(true);
            return;
        }

        var isValid = Object.keys(parsedValue).every(function(key) {
            if (!allowedKeys.includes(key)) {
                gs.addErrorMessage(gs.getMessage("Invalid key. Please ensure no extra spaces. Only keys allowed are {0} ", allowedKeys.join(',')));
                return false;
            }

            if (gs.nil(parsedValue[key]) || isNaN(parsedValue[key]) || parsedValue[key] < 0) {
                gs.addErrorMessage(gs.getMessage('Invalid value. Value should be a number greater than zero'));
                return false;
            }
            return true;
        });

        if (!isValid) {
            current.setAbortAction(true);
        }
    }

})(current, previous);
