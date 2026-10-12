(function executeRule(current, previous /*null when async*/ ) {
    if (current.operation() === 'delete') {
        gs.addErrorMessage(gs.getMessage('The MID IPKI user record cannot be deleted.'));
        current.setAbortAction(true);
        return;
    }

    var protectedFields = ['user_name', 'name', 'first_name', 'last_name', 'active', 'source',
        'internal_integration_user', 'identity_type'
    ];
    for (var i = 0; i < protectedFields.length; i++) {
        if (current[protectedFields[i]].changes()) {
            gs.addErrorMessage(gs.getMessage('The MID IPKI user record cannot be modified.'));
            current.setAbortAction(true);
            return;
        }
    }

})(current, previous);
