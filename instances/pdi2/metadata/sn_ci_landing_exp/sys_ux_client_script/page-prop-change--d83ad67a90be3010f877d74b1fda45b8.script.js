/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if(event.payload.name == "t"){
        api.data.cta_cards.refresh();
        api.data.landing_stage.refresh();
    }
}
