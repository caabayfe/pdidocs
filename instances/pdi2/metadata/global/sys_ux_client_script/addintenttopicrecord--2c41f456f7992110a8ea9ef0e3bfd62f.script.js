/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var arIntent = api.state.arIntent;
    var arTopic = api.state.arTopic;
    var active = api.state.active;
    var recordId = api.state.payload.fieldValue;
    var wizardId = 'e06b0afdeb7281102b57e53069522852';

    // Throw error if a reocrd with the input intent already exists
    if (api.data.look_up_records_2.results.length > 0) {
        api.setState('errorMessage', "Intent topic mapping already exists for this configuration's Auto-Resolution intent.");
        api.setState('hideAlert2', false);
    }

    // Throw error if either of the mandatory fields are empty
    else if (arIntent == null || arTopic == null) {
        api.setState('errorMessage', 'Please fill out all the mandatory fields.');
        api.setState('hideAlert2', false);
    }

    // No errors so create record
    else {
        api.data.create_record_1.execute({
            table: 'sys_cs_auto_resolution_intent_topic_map',
		    templateFields: 'active=' + active + "^ar_configuration=" + recordId + "^ar_intent=" + arIntent + "^matched_topic=" + arTopic,
		    useSetDisplayValue: ''
        });
        helpers.modal.close("custom_2", {});
    }
}
