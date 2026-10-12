/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const teams_override_id = 'a85fa47387360110f5817515dabb35d6';
    const slack_override_id = '578f6e6dc3fa1110bf30c265cb40dde8';

    helpers.snHttp(`/api/now/table/sys_properties/${teams_override_id}`, {method: 'GET'})
        .then(({response}) => {
            api.setState('teamsOverrideValue', response.result.value);
        })
        .catch(({error}) => {
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });

        helpers.snHttp(`/api/now/table/sys_properties/${slack_override_id}`, {method: 'GET'})
        .then(({response}) => {
            api.setState('slackOverrideValue', response.result.value);
        })
        .catch(({error}) => {
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
}
