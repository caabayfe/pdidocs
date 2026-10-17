/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Create system property for 'conversation_history.enabled' if not present

    var fieldValues = 'name=com.glide.cs.conversation_history.enabled' +
        '^value=false' +
        '^type=boolean' +
         '^description=Displays the requester\'s conversation history to agents during live interactions.' +
          '^read_roles=virtual_agent_admin' +
          '^write_roles=virtual_agent_admin' +
        '^ignore_cache=true';
    var conversationHistoryEnabled = api.data.look_up_sys_prop.result;

    if (!conversationHistoryEnabled)
        return;

    if (Object.keys(conversationHistoryEnabled).length === 0) {

        api.data.create_record.execute({
            table: 'sys_properties',
            templateFields: fieldValues
        });

        api.data.look_up_sys_prop.refresh();
    }
    
    // Create system property for 'com.glide.cs.conversation_history.number_of_past_interactions_to_display' if not present
    fieldValues = 'name=com.glide.cs.conversation_history.number_of_past_interactions_to_display' +
        '^value=10' +
        '^type=integer' +
        '^description=Number of closed interactions in the conversation history. \\nDefault value is 10. \\nThe value must be a positive integer between 1 to 25.'+
          '^read_roles=virtual_agent_admin' +
          '^write_roles=virtual_agent_admin' +
        '^ignore_cache=true';

    var numberOfPastInteractions = api.data.look_up_for_number_of_interactions.result;

    if (!numberOfPastInteractions)
        return;

    if (Object.keys(numberOfPastInteractions).length === 0) {

        api.data.create_record.execute({
            table: 'sys_properties',
            templateFields: fieldValues
        });

        api.data.look_up_for_number_of_interactions.refresh();
    }

}
