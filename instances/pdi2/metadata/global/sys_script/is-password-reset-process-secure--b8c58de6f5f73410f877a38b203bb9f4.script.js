(function executeRule(current, previous /*null when async*/ ) {
    var ACTION_DELETE = 'delete';
    var ACTION_UPDATE = 'update';

    if (!isProcessSecure()) {
        throwError(gs.getMessage("The verifications configured are not secure enough for this password reset process."));
        return;
    }

    function isProcessSecure() {
        var secureVerificationsCount = 0;
        var nonSecureVerificationsCount = 0;
        var mandatorySecureVerificationsCount = 0;

        var processGr = new GlideRecord('pwd_process');
        processGr.get(current.process);

        var verificationMapGr = new GlideRecord('pwd_map_proc_to_verification');
        verificationMapGr.addQuery('process', processGr.sys_id);
        verificationMapGr.query();

        // Check existing verifications
        while (verificationMapGr.next()) {
            var grVerificationType = new GlideRecord("pwd_verification");
            grVerificationType.get(verificationMapGr.getValue('verification'));
            grVerificationType.query();
            var mandatory = verificationMapGr.mandatory;
            if (PwdConstants.NONSECURE_VERIFICATIONTYPES[grVerificationType.getValue('type')] == true) {
                nonSecureVerificationsCount++;
            } else {
                secureVerificationsCount++;
                if (mandatory == true)
                    mandatorySecureVerificationsCount++;
            }
        }

        // Check current changes in the verification type
        if (PwdConstants.NONSECURE_VERIFICATIONTYPES[current.verification.type] == true && current.operation() == ACTION_DELETE) {
            nonSecureVerificationsCount--;
        } else if (!PwdConstants.NONSECURE_VERIFICATIONTYPES[current.verification.type]) {
            if (current.operation() == ACTION_DELETE) {
                secureVerificationsCount--;
                if (current.mandatory == true)
                    mandatorySecureVerificationsCount--;
            } else if (current.operation() == ACTION_UPDATE) {
                if (current.mandatory == false && previous.mandatory == true)
                    mandatorySecureVerificationsCount--;
                if (current.mandatory == true && previous.mandatory == false)
                    mandatorySecureVerificationsCount++;
            }
        }

        return ((mandatorySecureVerificationsCount > 0) || (nonSecureVerificationsCount < processGr.min_verifications))
    }


    function throwError(errorMessage) {
        gs.addErrorMessage(errorMessage);
        current.setAbortAction(true);
    }
})(current, previous);
