(function() {
    if (pm.isZboot()) return;
    // Step 1: Build a map of question sys_id -> set of types from service mappings
    var questionTypeMap = {};
    var mappingGr = new GlideRecord('knowledge_based_question_service_mapping');
    if (!mappingGr.isValid()) {
        gs.error('KB Redesign Migration: knowledge_based_question_service_mapping table is not valid');
        return;
    }
    mappingGr.addActiveQuery();
    mappingGr.query();

    while (mappingGr.next()) {
        var questionId = mappingGr.getValue('question');
        var mappingType = (mappingGr.getValue('type') || '').toLowerCase();

        if (!questionTypeMap[questionId]) {
            questionTypeMap[questionId] = {};
        }
        questionTypeMap[questionId][mappingType] = true;
    }

    // Step 2: Update each question with appropriate type and channel
    var questionGr = new GlideRecord('knowledge_based_question');
    if (!questionGr.isValid()) {
        gs.error('KB Redesign Migration: knowledge_based_question table is not valid');
        return;
    }
    questionGr.query();
    var updatedCount = 0;
    var skippedCount = 0;

    while (questionGr.next()) {
        var qId = questionGr.getUniqueValue();
        var types = questionTypeMap[qId] || {};
        var hasIdentification = types['identification'] === true;
        var hasAuthentication = types['authentication'] === true;

        var newType;
        var category = questionGr.getValue('category') || '';

        if (category === 'phone_number') {
            // Phone number questions are always identification only
            newType = 'identification';
        } else if (hasIdentification && hasAuthentication) {
            newType = 'identification_or_authentication';
        } else if (hasIdentification) {
            newType = 'identification';
        } else if (hasAuthentication) {
            newType = 'authentication';
        } else {
            // No mappings found — default to identification_or_authentication
            newType = 'identification_or_authentication';
        }

        // Only update if the field is empty or needs change
        var currentType = questionGr.getValue('type');
        var currentChannel = questionGr.getValue('channel');

        if (currentType != newType || currentChannel != 'voice') {
            questionGr.setValue('type', newType);
            questionGr.setValue('channel', 'voice');
            questionGr.setWorkflow(false);
            questionGr.autoSysFields(false);
            questionGr.update();
            updatedCount++;
        } else {
            skippedCount++;
        }
    }

    gs.info('KB Redesign Migration: Updated type/channel on ' + updatedCount + ' questions, skipped ' + skippedCount + ' (already set)');
})();
