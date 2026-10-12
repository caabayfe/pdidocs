(function executeRule(current, previous /*null when async*/ ) {
    var expression = current.expression;
    if (!new SNC.DataPatternValidatorCore().isValid(expression)) {
        var currentSupportedMaxLength = DataDiscoveryConstantsCore.MAX_SUPPORTED_DATA_PATTERN_REGEX_LENGTH + "";
        var invalidPatternMsg = sn_i18n.Message.getMessage('com.glide.data_privacy_core', '{boldTagOpen}Regular expression error{boldTagClose}. Please make sure the regular expression is in a valid format and is not more than {supportedRegexLength} characters.', {
            'boldTagOpen': '<b>',
            'boldTagClose': '</b>',
            'supportedRegexLength': currentSupportedMaxLength
        });
        gs.addErrorMessage(invalidPatternMsg);
        current.setAbortAction(true);
    }
})(current, previous);
