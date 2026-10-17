(function executeRule(current, previous /*null when async*/ ) {

    var type = current.getValue('type');
    var name = current.getValue('name');
    var target_type = current.getValue('target_type');

    //Validate empty fields
    if (type == null || name == null || target_type == null) {
        gs.addErrorMessage(gs.getMessage('Please enter a valid HPAv2 Metric Record'));
        current.setAbortAction(true);
        return;
    }

    //Validate name
    if (name != "cpu" && name != "memory") {
        gs.addErrorMessage(gs.getMessage('Please enter a valid HPAv2 Metric Record, only cpu and memory resource names are supported'));
        current.setAbortAction(true);
        return;
    }

    //Validate MetricTarget and matching value
    switch (target_type) {
        case "Utilization":
            if (current.getValue('target_average_utilization') == null) {
                gs.addErrorMessage(gs.getMessage('Please enter a valid HPAv2 Metric Record: Target Type matching value is required and cannot be empty'));
                current.setAbortAction(true);
            }
            break;
        case "AverageValue":
            if (current.getValue('target_average_value') == null) {
                gs.addErrorMessage(gs.getMessage('Please enter a valid HPAv2 Metric Record: Target Type matching value is required and cannot be empty'));
                current.setAbortAction(true);
            }
            break;
        case "Value":
            if (current.getValue('target_value') == null) {
                gs.addErrorMessage(gs.getMessage('Please enter a valid HPAv2 Metric Record: Target Type matching value is required and cannot be empty'));
                current.setAbortAction(true);
            }
            break;
    }

})(current, previous);
