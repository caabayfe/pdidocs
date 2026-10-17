(function executeRule(current, previous /*null when async*/ ) {

    var maxWorkNoteLengthPropName = 'promin.agent_activity_analysis.max_length_work_note';
    var minWorkNoteLengthPropName = 'promin.agent_activity_analysis.min_length_work_note';
    var percentageThresholdPropName = 'promin.agent_activity_analysis.min_worknote_percentage_threshold';
    var maxRecordsPerClusterPropName = 'promin.agent_activity_analysis.max_records_per_cluster';
    var minEligibleWorknotesPropName = 'promin.agent_activity_analysis.min_eligible_worknotes';

    var propertyName = current.getValue("name");
    var propertyValue = parseInt(current.getValue("value"), 10);

    // Check if the property is one of the properties we need to validate
    if (propertyName !== maxWorkNoteLengthPropName &&
        propertyName !== minWorkNoteLengthPropName &&
        propertyName !== percentageThresholdPropName &&
        propertyName !== maxRecordsPerClusterPropName &&
        propertyName !== minEligibleWorknotesPropName) {
        return;
    }

    var maxPropValue, minPropValue;
    if (propertyName === maxWorkNoteLengthPropName) {
        maxPropValue = propertyValue;
        minPropValue = parseInt(gs.getProperty(minWorkNoteLengthPropName), 10);

        if (maxPropValue > 2000) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be greater than 2000.", maxWorkNoteLengthPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
    }

    if (propertyName === minWorkNoteLengthPropName) {
        minPropValue = propertyValue;
        maxPropValue = parseInt(gs.getProperty(maxWorkNoteLengthPropName), 10);
        if (minPropValue < 3) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be less than 3.", minWorkNoteLengthPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
    }

    if (!isNaN(maxPropValue) && !isNaN(minPropValue)) {
        if (maxPropValue <= minPropValue) {
            gs.addErrorMessage(gs.getMessage("{0} ({1}) must be greater than {2} ({3}).", [maxWorkNoteLengthPropName, maxPropValue.toFixed(0), minWorkNoteLengthPropName, minPropValue.toFixed(0)]));
            current.setAbortAction(true);
            action.setRedirectURL(current);
        }
    }

    // min_worknote_percentage_threshold (Min: 1, Max: 100)
    if (propertyName === percentageThresholdPropName) {
        if (propertyValue < 1) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be less than 1.", percentageThresholdPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
        if (propertyValue > 100) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be greater than 100.", percentageThresholdPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
    }

    // max_records_per_cluster (Min: 1, Max: 200)
    if (propertyName === maxRecordsPerClusterPropName) {
        if (propertyValue < 1) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be less than 1.", maxRecordsPerClusterPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
        if (propertyValue > 200) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be greater than 200.", maxRecordsPerClusterPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
    }

    // min_eligible_worknotes (Min: 5, Max: 50)
    if (propertyName === minEligibleWorknotesPropName) {
        if (propertyValue < 5) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be less than 5.", minEligibleWorknotesPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
        if (propertyValue > 50) {
            gs.addErrorMessage(gs.getMessage("The value for {0} cannot be greater than 50.", minEligibleWorknotesPropName));
            current.setAbortAction(true);
            action.setRedirectURL(current);
            return;
        }
    }

})(current, previous);
