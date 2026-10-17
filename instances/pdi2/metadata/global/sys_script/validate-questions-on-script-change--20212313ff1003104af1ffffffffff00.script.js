(function executeRule(current, previous /*null when async*/) {
    // Only check on script_configuration change
    if (!previous || current.getValue('script_configuration') == previous.getValue('script_configuration')) {
        return;
    }

    var newScriptConfig = current.getValue('script_configuration') || '';

    // No script configuration — always allowed
    if (!newScriptConfig) {
        return;
    }

    // Find all questions mapped to this answer
    var qaMappingGr = new GlideRecord('knowledge_based_question_answer_mapping');
    if (!qaMappingGr.isValid()) return;
    qaMappingGr.addQuery('answer', current.getUniqueValue());
    qaMappingGr.query();

    while (qaMappingGr.next()) {
        var questionGr = new GlideRecord('knowledge_based_question');
        if (!questionGr.get(qaMappingGr.getValue('question'))) {
            continue;
        }

        var questionType = questionGr.getValue('type') || '';

        // identification_or_authentication questions cannot have any script answers
        if (questionType == 'identification_or_authentication') {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot change script configuration. This answer is mapped to question "{0}" which has type "Identification or Authentication". Script configuration is not allowed for that question type.', [questionGr.getValue('question')]));
            return;
        }

        // Script config must match the question type
        if (questionType && questionType != newScriptConfig) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot change script configuration to "{0}". This answer is mapped to question "{1}" which has type "{2}". Script configuration must match the question type.', [newScriptConfig, questionGr.getValue('question'), questionType]));
            return;
        }
    }
})(current, previous);
