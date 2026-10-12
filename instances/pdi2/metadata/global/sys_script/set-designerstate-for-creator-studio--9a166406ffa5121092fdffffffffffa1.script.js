(function executeRule(current, previous) {
    var currentTriggerInputs = current.trigger_inputs;
    var currentCondition = currentTriggerInputs.condition || '';
    var previousTriggerInputs = previous.trigger_inputs;
    var previousCondition = previousTriggerInputs.condition || '';

    var rpRegex = /request_type=([a-z0-9]+)/i; // Regex to find the record producer ID
    var currentMatch = currentCondition.match(rpRegex);
    var currentRpId = (currentMatch && currentMatch[1]);

    var previousMatch = previousCondition.match(rpRegex);
    var previousRpId = (previousMatch && previousMatch[1]);

    if (currentRpId !== previousRpId) {
        var pdSysId = current.getValue('process_definition');
        var pdGr = new GlideRecord('sys_pd_process_definition');
        pdGr.get(pdSysId);

        // Check for Creator Studio process type
        if (pdGr.getValue('process_type') !== 'a487710eff0f3110893effffffffff4d')
            return;

        var designerStateString = pdGr.getValue('designer_state') || '{}';
        var designerState = {};
        var designerStateNew = {};

        try {
            designerState = JSON.parse(designerStateString);
        } catch (e) {
            return gs.error(gs.getMessage('Parsing designer_state from sys_pd_trigger_instance_{0} failed', current.getUniqueValue()), e);
        }

        Object.assign(designerStateNew, designerState);
        designerStateNew['creatorStudioRecordProducerId'] = currentRpId; // A sys_id or NULL
        pdGr.setValue('designer_state', JSON.stringify(designerStateNew));
        pdGr.update();
    }
})(current, previous);
