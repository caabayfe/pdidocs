/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */
function script({api, event,  helpers, imports}) { 
    const { addDataToContext } = imports['sn_record_page.ContextHelper']();
    addDataToContext(...arguments);
    const raHelper = imports['sn_nb_action.RAHelper'](...arguments);
    raHelper.showRecommendations();
}
