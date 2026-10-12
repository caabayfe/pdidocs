var requestAppTableGr = new GlideRecord('sys_db_object'); // Verify request app config table exists
if (requestAppTableGr.get('name', 'sn_creatorstudio_request_app_config')) {
    try {
        var countMillis = new GlideDateTime().getNumericValue(); // Measure how long the script takes.
        gs.info(gs.getMessage('START: Adding record producers to playbook designer states'), 'addRecordProducersToPlaybookDesignerState');
        addRecordProducersToPlaybookDesignerState();
        gs.info(gs.getMessage('COMPLETE: Adding record producers to playbook designer states ({0}ms)', new GlideDateTime().getNumericValue() - countMillis), 'addRecordProducersToPlaybookDesignerState');
    } catch (e) {
        gs.error(gs.getMessage('ERROR: There was an error adding record producers to playbook designer states'), e);
    }
}

function addRecordProducersToPlaybookDesignerState() {
    var rpRegex = /request_type=([a-z0-9]+)/i; // Regex to find the record producer ID

    var processGr = new GlideRecord('sys_pd_process_definition');
    processGr.addJoinQuery('sn_creatorstudio_request_app_config', 'sys_scope', 'sys_scope');
    processGr.query();
    while (processGr.next()) {
        var triggerInstanceGr = new GlideRecord('sys_pd_trigger_instance');
        triggerInstanceGr.addQuery('process_definition', processGr.getUniqueValue());
        triggerInstanceGr.query();

        while (triggerInstanceGr.next()) { // There should only be one trigger, but just in case make sure to get the one with a record producer. 
            var triggerInputs = triggerInstanceGr.getElement('trigger_inputs');
            var match = triggerInputs['condition'].match(rpRegex);
            var recordProducerId = match && match[1];
            if (!recordProducerId)
                continue;
            var designerStateString = processGr.getValue('designer_state') || '{}';
            var designerState = {};
            var designerStateNew = {};
            try {
                designerState = JSON.parse(designerStateString);
            } catch (e) {
                gs.error(gs.getMessage('Parsing designer_state from sys_pd_trigger_instance_{0} failed', triggerInstanceGr.getUniqueValue()), e);
                continue;
            }
            Object.assign(designerStateNew, designerState);
            designerStateNew['creatorStudioRecordProducerId'] = recordProducerId;
            processGr.setValue('designer_state', JSON.stringify(designerStateNew));
            processGr.update();
        }
    }
}
