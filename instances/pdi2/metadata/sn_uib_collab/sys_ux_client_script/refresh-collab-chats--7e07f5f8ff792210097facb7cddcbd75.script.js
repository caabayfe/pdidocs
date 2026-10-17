/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var chatSysId, type, participantSysId;
    if (event.payload.data.table_name == "sys_cs_collab_member") {
        if (event.payload.data.operation == "insert")
            chatSysId = event.payload.data.record.collab_chat.value;
        if (event.payload.data.operation == "update" && event.payload.data.changes[0] == 'active')
            participantSysId = event.payload.data.sys_id;
        type = 'sidebar_discussion';
        
    } else if (event.payload.data.table_name == "sn_tcm_collab_hook_ms_teams_chat") {
        chatSysId = event.payload.data.sys_id;
        type = 'microsoft_teams_chat';
    }
    if (chatSysId || participantSysId) {        
        api.setState('refreshChatInputs', {
            chatSysId,
            participantSysId,
            type
        });
    }
}
