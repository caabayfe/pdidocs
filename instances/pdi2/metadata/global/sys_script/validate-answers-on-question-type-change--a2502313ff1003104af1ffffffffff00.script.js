(function executeRule(current, previous /*null when async*/) {
    // Only check on type change
    if (!previous || current.getValue('type') == previous.getValue('type')) {
        return;
    }

    var newType = current.getValue('type') || '';

    // Check all answer mappings for this question
    var qaMappingGr = new GlideRecord('knowledge_based_question_answer_mapping');
    if (!qaMappingGr.isValid()) return;
    qaMappingGr.addQuery('question', current.getUniqueValue());
    qaMappingGr.query();

    while (qaMappingGr.next()) {
        var answerGr = new GlideRecord('knowledge_based_answer');
        if (!answerGr.get(qaMappingGr.getValue('answer'))) {
            continue;
        }

        var scriptConfig = answerGr.getValue('script_configuration') || '';
        if (!scriptConfig) {
            continue;
        }

        // identification_or_authentication cannot have any script answers
        if (newType == 'identification_or_authentication') {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot change type to "Identification or Authentication". This question has answer mappings with script configuration "{0}". Remove the script-based answer mappings first.', [scriptConfig]));
            return;
        }

        // Script config must match the new question type
        if (newType == 'identification' && scriptConfig != 'identification') {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot change type to "Identification". This question has an answer with "{0}" script configuration which is incompatible. Update the answer mapping first.', [scriptConfig]));
            return;
        }

        if (newType == 'authentication' && scriptConfig != 'authentication') {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot change type to "Authentication". This question has an answer with "{0}" script configuration which is incompatible. Update the answer mapping first.', [scriptConfig]));
            return;
        }
    }
})(current, previous);
