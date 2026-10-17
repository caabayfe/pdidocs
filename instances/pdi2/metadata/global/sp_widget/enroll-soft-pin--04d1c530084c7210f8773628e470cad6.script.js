(function(data) {
    data.enrollmentEnabled = gs.getProperty('glide.auth_factors.softpin.enrollment.enabled', 'false') == 'true';
    data.disabledMessage = gs.getMessage('Soft PIN enrollment is not available at this time. Please contact administrator for more details');
    if (!data.enrollmentEnabled) return;

    data.verificationId = "06a5c9845302011017c3ddeeff7b1229";
    var question = new SNC.PwdSoftPINManager().getQuestion(data.verificationId);
    data.softPinMsg = question;
    data.softPinRulesMsg = gs.getMessage("Here are the rules for Soft PIN:");
    data.enrollMsg = gs.getMessage("Steps to enroll");


    var pinRules = [];
    var pinLength = new SNC.PwdSoftPINManager().getPINLength(data.verificationId);
    data.pinLengthRule = gs.getMessage("Length must be {0} digits.", pinLength);
    data.pinLength = pinLength;

    var pinRepetitionThreshold = new SNC.PwdSoftPINManager().getPINRepetitionThreshold(data.verificationId);
    data.repetitionThresholdRule = gs.getMessage("PIN repetition threshold is {0}.", pinRepetitionThreshold);
    data.pinRepetitionThreshold = pinRepetitionThreshold;

    var pinSequenceThreshold = new SNC.PwdSoftPINManager().getPINSequenceThreshold(data.verificationId);
    data.sequenceThresholdRule = gs.getMessage("PIN sequence threshold is {0}.", pinSequenceThreshold);
    data.pinSequenceThreshold = pinSequenceThreshold;

    var pinHistoryLimit = new SNC.PwdSoftPINManager().getSoftPINHistoryLimit();
    data.pinHistoryRule = pinHistoryLimit === '1' ? gs.getMessage("You can't use your previous Soft PIN.") : gs.getMessage("You can't reuse your previous {0} Soft PINs.", pinHistoryLimit);
    pinRules.push(data.pinLengthRule, data.repetitionThresholdRule, data.sequenceThresholdRule, data.pinHistoryRule);
    data.softPinRules = pinRules;
})(data);
