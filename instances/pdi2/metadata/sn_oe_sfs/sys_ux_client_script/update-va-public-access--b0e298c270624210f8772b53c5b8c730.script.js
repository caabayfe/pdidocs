/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.elementId == 'action_button') {
        api.setState('modalButtonClicked', true);
        helpers.translate('VA chat web client settings saved successfully.').then((translatedText) => {
            api.setState('infoMessage', translatedText);
        });
        api.data.update_record.execute({
            table: 'sys_public',
            recordId: '2e4b293773e013004ab2369f2ef6a7a5',
            templateFields: 'active=' + api.state.publicAccess,
            useSetDisplayValue: null
        });
        if (!api.state.publicAccess) {
            api.data.deactivate_public_assistant_agent_chats.execute();
        }
    }
    helpers.modal.close('public_access_modal');
}
