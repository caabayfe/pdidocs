/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    await api.data.save_user_preference_1.execute({
      "name": "sow.home.announcement.mode",
      "value": event.elementId == "button_iconic_grid_1" ? 'grid' : 'list'
    });
}
