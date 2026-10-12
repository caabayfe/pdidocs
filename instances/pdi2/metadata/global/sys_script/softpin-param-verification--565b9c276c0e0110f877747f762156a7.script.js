// SoftPIN Verification Type
// parameter validations

validateVerificationParam();

function validateVerificationParam() {
    gs.include('PwdVerificationParameterUtility');


    var MINIMUM_SOFTPIN_LENGTH = 6;
    var MINIMUM_REPETITION_THRESHOLD = 2;
    var MINIMUM_SEQUENCE_THRESHOLD = 2;
    var softPINMinimumLength = gs.getProperty('password_reset.softpin.min_length', MINIMUM_SOFTPIN_LENGTH);

    //SoftPIN length should not be less than minimumPINLength digits
    if (current.name == 'pin_length') {
        assertGreaterOrEqual(current.value, softPINMinimumLength, gs.getMessage('[pin_length] should be a positive Integer of value atleast [{0}]', softPINMinimumLength));
    }

    //SoftPIN digits continuous repetition threshold
    if (current.name == 'repetition_threshold') {
        assertGreaterOrEqual(current.value, MINIMUM_REPETITION_THRESHOLD, gs.getMessage('[repetition_threshold] should be a positive Integer of value atleast [{0}]', MINIMUM_REPETITION_THRESHOLD));
    }

    //SoftPIN digits numeric sequence threshold
    if (current.name == 'sequence_threshold') {
        assertGreaterOrEqual(current.value, MINIMUM_SEQUENCE_THRESHOLD, gs.getMessage('[sequence_threshold] should be a positive Integer of value atleast [{0}]', MINIMUM_SEQUENCE_THRESHOLD));
    }
}

function assertGreaterOrEqual(propLarger, propSmaller, errMsg) {
    var utility = new PwdVerificationParameterUtility();
    if (!utility.isPositiveInteger(current.value) || (parseInt(propLarger) < parseInt(propSmaller))) {
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
}
