(function executeRule(current, previous /*null when async*/) {
    var questionGr = new GlideRecord('knowledge_based_question');
    if (!questionGr.get(current.question)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Referenced question does not exist.'));
        return;
    }

    var questionType = questionGr.getValue('type') || '';
    var mappingType = (current.getValue('type') || '').toLowerCase();

    if (!mappingType) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Type field is required.'));
        return;
    }

    // If question has no type set (legacy record) or is identification_or_authentication, any mapping type is valid
    if (!questionType || questionType == 'identification_or_authentication') {
        return;
    }

    // Otherwise, mapping type must match question catalog type exactly
    if (questionType != mappingType) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Mapping type "{0}" is not compatible with question type "{1}". The question is configured for "{1}" only.', [mappingType, questionType]));
    }
})(current, previous);
