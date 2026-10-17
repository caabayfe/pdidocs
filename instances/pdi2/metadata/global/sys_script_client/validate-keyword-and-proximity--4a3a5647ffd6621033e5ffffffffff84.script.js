function onSubmit() {
    var keyword = g_form.getValue('keyword');
    var keywordProximity = g_form.getValue('keyword_proximity');

    if (keyword.length > 128) {
        g_form.addErrorMessage(getMessage('Keyword(s) length should not exceed 128 characters.'));
        return false;
    }

    if (keyword.length > 0 && (keywordProximity.length == 0 || parseInt(keywordProximity) == 0)) {
        g_form.setValue('keyword_proximity', '30');
    }

    if (keywordProximity.length > 0) {
        var keywordProximityValue = parseInt(keywordProximity);
        if (keyword.length == 0) {
            g_form.addErrorMessage(getMessage('Configure keyword(s) before setting keyword proximity.'));
            return false;
        } else if (keywordProximityValue < 0 || keywordProximityValue > 64) {
            g_form.addErrorMessage(getMessage('Keyword proximity should be in range 0 to 64.'));
            return false;
        }
    }
}
