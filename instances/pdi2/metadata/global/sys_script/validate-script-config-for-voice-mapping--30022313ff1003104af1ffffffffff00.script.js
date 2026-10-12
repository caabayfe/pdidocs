(function executeRule(current, previous /*null when async*/) {
    var questionGr = new GlideRecord('knowledge_based_question');
    if (!questionGr.isValid()) return;
    if (!questionGr.get(current.question)) {
        return;
    }

    // Only apply restriction for voice channel questions
    if (questionGr.getValue('channel') != 'voice') {
        return;
    }

    var mappingType = (current.getValue('type') || '').toLowerCase();
    if (!mappingType) {
        return;
    }

    // Check all answer mappings for this question
    var qaMappingGr = new GlideRecord('knowledge_based_question_answer_mapping');
    if (!qaMappingGr.isValid()) return;
    qaMappingGr.addQuery('question', current.getValue('question'));
    qaMappingGr.query();

    while (qaMappingGr.next()) {
        var answerGr = new GlideRecord('knowledge_based_answer');
        if (!answerGr.get(qaMappingGr.getValue('answer'))) {
            continue;
        }

        var scriptConfig = (answerGr.getValue('script_configuration') || '').toLowerCase();

        // No script configuration — always allowed
        if (!scriptConfig) {
            continue;
        }

        // Script config must match the mapping type
        if (scriptConfig != mappingType) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot save the record. The question has an answer with "{0}" script configuration which is incompatible with mapping type "{1}". Script configuration must match the mapping type for voice channel questions.', [scriptConfig, mappingType]));
            return;
        }
    }
})(current, previous);
