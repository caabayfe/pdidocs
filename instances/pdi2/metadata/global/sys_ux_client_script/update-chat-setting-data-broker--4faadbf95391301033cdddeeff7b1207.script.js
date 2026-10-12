/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const csFormData = api.state.chat_setup;
    if (!csFormData || !csFormData.sys_id)
        return;

    const recordId = csFormData.sys_id;
    let fieldValues = 'live_agent_enabled=' + csFormData.live_agent_enabled.value +
        '^show_agent_details=' + csFormData.show_agent_details.value +
        '^show_agent_name_in_header=' + csFormData.show_agent_name_in_header.value +
        '^allow_transcript_download=' + csFormData.allow_transcript_download.value +
        '^wait_status=' + (csFormData.wait_status.value || 'NULL') +
        '^transfer_message=' + csFormData.transfer_message.value +
        '^no_agent_available_message=' + csFormData.no_agent_available_message.value +
        '^agent_whisper=' + csFormData.agent_whisper.value +
        '^emoji_enabled=' + csFormData.emoji_enabled.value;
    
    if (csFormData.autopilot_client_messages_enabled)
        fieldValues += '^autopilot_client_messages_enabled=' + csFormData.autopilot_client_messages_enabled.value;

    // Update glide record
    api.data.update_chat_setup.execute({
        table: 'sys_cs_live_agent_setup',
        recordId: recordId,
        templateFields: fieldValues,
        useSetDisplayValue: null
    });

    api.emit('SCREEN_STATUS_CHANGED', { isDirty : false });
}
