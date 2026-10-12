/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const viewport = await api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_1',
        route: 'list-selector'
    });
    const modal = await helpers.modal.open('modal_viewport_1',{size:"custom",customSize:{width:"850px"}});
}
