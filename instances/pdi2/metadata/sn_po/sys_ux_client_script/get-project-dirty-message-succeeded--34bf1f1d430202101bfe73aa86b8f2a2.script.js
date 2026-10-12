/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let message = '';
    try {
        message = api.data.get_project_dirty_message.output.data.snPo.GlidePromin.prominGetProjectDirtyMessage.message;
    } catch(err) {}

    if (!message) {
        return;
    }

    api.setState('dirtyProjectAlert', {
        hidden: false,
        message,
    });
}
