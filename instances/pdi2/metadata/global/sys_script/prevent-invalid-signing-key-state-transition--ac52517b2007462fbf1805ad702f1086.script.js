(function executeRule(current, previous /*null when async*/) {
    var validTransitions = {
        'pre_activation': ['active', 'suspended', 'compromised', 'deactivated'],
        'active': ['suspended', 'compromised', 'deactivated'],
        'suspended': ['active', 'compromised', 'deactivated'],
        'deactivated': ['active', 'compromised'],
        'compromised': []
    };

    var oldState = previous.state + '';
    var newState = current.state + '';

    var allowed = validTransitions[oldState];
    if (allowed === undefined || allowed.indexOf(newState) === -1) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Invalid state transition from '{0}' to '{1}' on signing key", [oldState, newState]));
    }
})(current, previous);
