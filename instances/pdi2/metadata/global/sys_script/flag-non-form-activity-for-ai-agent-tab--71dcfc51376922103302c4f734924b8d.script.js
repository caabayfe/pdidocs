(function executeRule(current, previous /*null when async*/ ) {
    // Check if current object is null or undefined
    if (!current) {
        return;
    }

    g_scratchpad.willRenderForm = new PDActivityDefinitionRepository().isFormBased(current);

})(current, previous);
