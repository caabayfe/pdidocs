check();

function check() {
    // Check if verification is empty:
    if (current.verification.nil()) {
        errMsg = gs.getMessage("You must specify a 'Verification' for the Password Reset process");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }

    // Check if process is empty:
    if (current.process.nil()) {
        errMsg = gs.getMessage("You must specify a 'Process' that is associated with the verification");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }

    // Prevent having same verification mapping (should be unique):
    // Note: we also have a DB unique constraint, but this rule will generate a clearer message.
    var gr = new GlideRecord('pwd_map_proc_to_verification');
    gr.addQuery('process', current.process);
    gr.addQuery('verification', current.verification);
    if (current.operation() == 'update') {
        gr.addQuery('sys_id', '<>', current.sys_id);
    }
    gr.query();
    if (gr.hasNext()) {
        errMsg = gs.getMessage("You cannot specify a particular verification more than once for a Password Reset process");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }

    //Preventing personal data confirmation verification for a public process
    if (current.verification.type == 'a7f17087eb1101004d7763fba206fe52' && current.process.public_access) {
        errMsg = gs.getMessage("Personal data confirmation verification can't be configured for a public process");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }

    //Preventing soft PIN verification for a service desk process
    if (current.verification.type == 'a67585845302011017c3ddeeff7b1267' && !current.process.public_access) {
        errMsg = gs.getMessage("Soft PIN verification can't be configured for a service desk process");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }

    // Prevent having multiple verifications based on the same verification type
    // PRB601121: we need to exclude Personnel Data types
    if (current.verification.type == '2f39b371eb1101004d7763fba206fed1' ||
        current.verification.type == 'a7f17087eb1101004d7763fba206fe52') {
        // either personnel verification or confirmation
        return;
    }

    var gr = new GlideRecord('pwd_map_proc_to_verification');
    gr.addQuery('process', current.process);
    gr.addQuery('verification.type', current.verification.type);
    if (current.operation() == 'update') {
        gr.addQuery('sys_id', '<>', current.sys_id);
    }
    gr.query();
    if (gr.hasNext()) {
        errMsg = gs.getMessage("The Password Reset process can include only one verification of each verification type. Delete the extra verifications and then, if needed, add a verification of a different type.");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
}
