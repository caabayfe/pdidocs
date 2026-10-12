(function executeRule(current, previous /*null when async*/) {
    var questionGr = new GlideRecord('knowledge_based_question');
    if (!questionGr.get(current.question)) {
        return;
    }

    var answerGr = new GlideRecord('knowledge_based_answer');
    if (!answerGr.get(current.answer)) {
        return;
    }

    var questionType = questionGr.getValue('type') || '';
    var scriptConfig = answerGr.getValue('script_configuration') || '';

    // No script configuration — always allowed
    if (!scriptConfig) {
        return;
    }

    // identification_or_authentication questions cannot have script answers
    if (questionType == 'identification_or_authentication') {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Questions with type "Identification or Authentication" cannot be mapped to answers with script configuration. Script answers are only supported for questions that are exclusively Identification or exclusively Authentication.'));
        return;
    }

    // Script config must match the question type
    if (questionType == 'identification' && scriptConfig != 'identification') {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Identification questions can only be mapped to answers with "Identification" script configuration, not "{0}".', [scriptConfig]));
        return;
    }

    if (questionType == 'authentication' && scriptConfig != 'authentication') {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save the record. Authentication questions can only be mapped to answers with "Authentication" script configuration, not "{0}".', [scriptConfig]));
        return;
    }
})(current, previous);
