// This BR doesn't allow 'is_legacy_password2' value change
(function executeRule(current, previous /*null when async*/ ) {
    if ((current.attributes && current.attributes.indexOf('is_legacy_password2') > -1) ||
        (previous.attributes && previous.attributes.indexOf('is_legacy_password2') > -1)) {
        var oldPwd2Attribute = getLegacyPwd2AttributeValue(previous.attributes);
        var newPwd2Attribute = getLegacyPwd2AttributeValue(current.attributes);

        gs.debug("BR: Trying to update 'is_legacy_password2' attribute value from:" + oldPwd2Attribute + ", to:" + newPwd2Attribute);
        if (oldPwd2Attribute != newPwd2Attribute) {
            gs.addErrorMessage(gs.getMessage("Attribute 'is_legacy_password2' value can not be changed"));
            current.setAbortAction(true);
            return;
        }
    }
})(current, previous);

function getLegacyPwd2AttributeValue(text) {
    var i = 0;
    if (text == '' || (i = text.indexOf('is_legacy_password2')) == -1)
        return '';

    var nextComma = text.indexOf(',', i);
    if (nextComma == -1)
        nextComma = text.length;

    return text.substring(text.indexOf('=', i) + 1, nextComma).trim();
}
