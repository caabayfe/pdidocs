(function executeRule(current, previous /*null when async*/ ) {

    if (current.name == 'sn_flow_designer.maximum_flow_history_records_per_flow') {
        var value = parseInt(current.value, 10);

        if (isNaN(value)) {
            // Handle non-numeric values
            gs.addErrorMessage(gs.getMessage('Maximum number of flow history records must be a number. Setting to 100 by default.'));
            current.value = 100;
        } else if (value < 30) {
            // Handle numeric values lower than 30
            gs.addErrorMessage(gs.getMessage('Maximum number of flow history records must be at least 30. Save cancelled.'));
            current.setAbortAction(true);
        } else if (value > 200) {
            gs.addErrorMessage(gs.getMessage('Maximum number of flow history records cannot be greater than 200. Save cancelled.'));
            current.setAbortAction(true);
        }
    }

})(current, previous);
