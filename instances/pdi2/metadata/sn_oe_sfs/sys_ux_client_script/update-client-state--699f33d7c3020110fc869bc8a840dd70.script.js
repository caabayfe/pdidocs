/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (!api.data.ci_chat_settings_1.output || !api.data.ci_chat_settings_1.output.chat_setup)
        return;

    var chatSetup = api.data.ci_chat_settings_1.output.chat_setup;
    if (chatSetup.error) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: chatSetup.error
            }]
        });
        return;
    } 

    api.setState("chat_setup", chatSetup);
    
    if (chatSetup.crossScopeMessage) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'ac_scope_alert',
                status: 'warning',
                icon: 'circle-info-outline',
                content: {
                    type: 'html',
                    value: '<span>' + chatSetup.crossScopeMessage + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
	} 
}
