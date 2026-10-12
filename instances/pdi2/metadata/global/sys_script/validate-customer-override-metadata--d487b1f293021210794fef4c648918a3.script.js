(function executeRule(current, previous /*null when async*/) {

	var allowedKeysString = gs.getProperty('glide.analytics.bucket.allowed.customer.overrides.list', "HeartbeatInterval,SessionTimeout,MaxDataPointsPerHeartbeat,IdleTimeout,SendWebEventsToMobile");
	var keyRangeMap = {"HeartbeatInterval":[5000,120000], "IdleTimeout": [60000,7200000], "SessionTimeout": [60000,86400000], "MaxDataPointsPerHeartbeat": [100,5000]}
	var booleanKeys = ["SendWebEventsToMobile"];
    var allowedKeys = allowedKeysString.split(',').map(function(item) {
        return item.trim();
    });
    if (current.customer_override_configuration) {
        var parsedValue;
        try {
            parsedValue = JSON.parse(current.customer_override_configuration);
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
            if (booleanKeys.indexOf(key) > -1) {
                var boolValue = parsedValue[key];
                if (boolValue !== true && boolValue !== false && boolValue !== 'true' && boolValue !== 'false') {
                    gs.addErrorMessage(gs.getMessage('Invalid value. Value for {0} must be true or false', [key]));
                    return false;
                }
                return true;
            }
            if (gs.nil(parsedValue[key]) || isNaN(parsedValue[key]) || parsedValue[key] < 0 ) {
                gs.addErrorMessage(gs.getMessage('Invalid value. Value should be a number greater than zero'));
                return false;
            }
			else if (!gs.nil(keyRangeMap[key]) && (parsedValue[key]<keyRangeMap[key][0] || parsedValue[key]> keyRangeMap[key][1])) {
				gs.addErrorMessage(gs.getMessage('Invalid value. Value for {0} must be in range {1},{2}',[key,keyRangeMap[key][0], keyRangeMap[key][1]]));
				return false;
			}
            return true;
        });

        if (!isValid) {
            current.setAbortAction(true);
        }
    }

})(current, previous);
