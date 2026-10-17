(function executeRule(current, previous /*null when async*/) {
    var questionType = current.getValue('type');
    if (current.getValue('category') == 'phone_number' && (questionType == 'authentication' || questionType == 'identification_or_authentication')) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Questions with category "Phone Number" cannot have type "Authentication" or "Identification or Authentication". Phone number questions are only applicable for identification.'));
    }
})(current, previous);
