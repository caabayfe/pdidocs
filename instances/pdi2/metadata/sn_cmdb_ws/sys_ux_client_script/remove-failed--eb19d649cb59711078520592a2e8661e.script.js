/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [
            {
                id: 'failed1',
                    "status": "critical",
                    "icon": "exclamation-triangle-fill",
                    content:  await helpers.translate('Failed to remove selected records from exclusion list'),
                    action: { type: 'dismiss' }
            }
        ]
    });

}
