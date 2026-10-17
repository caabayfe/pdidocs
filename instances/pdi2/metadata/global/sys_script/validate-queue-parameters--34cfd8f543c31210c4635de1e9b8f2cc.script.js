(function executeRule(current, previous /*null when async*/ ) {

    if (current.parameter.name == 'priority' || current.parameter.name == 'claim_limit') {
        var value = Number(current.value);
        if (!Number.isInteger(value)) {
            gs.addErrorMessage(gs.getMessage('Invalid parameter value:"{0}"', current.value));
            current.setAbortAction(true);
        } else if (current.parameter.name == 'claim_limit' && (value <= 0 || value > 500)) {
            gs.addErrorMessage(gs.getMessage('Value of claim_limit should be between [1-500]', current.value));
            current.setAbortAction(true);
        }
    } else if (current.parameter.name == 'upgrade_safe' || current.parameter.name == 'slow_queue') {
        if (!current.value.equalsIgnoreCase('true') && !current.value.equalsIgnoreCase('false')) {
            gs.addErrorMessage(gs.getMessage('Valid values are true/false: "{0}"', current.value));
            current.setAbortAction(true);
        }
    }


})(current, previous);
