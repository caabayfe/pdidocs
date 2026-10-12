/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */
function script({api, event,  helpers, imports}) {  
    if (api.state.isRAInstalled) {
        try {
            const { addDataToContext } = imports['sn_record_page.ContextHelper']();
            addDataToContext(...arguments);
            const raHelper = imports['sn_nb_action.RAHelper'](...arguments);
            raHelper.getRecommendations();
        } catch (e) {
            //if there was an error importing the script include, it means it wasn't installed
            api.setState('isRAInstalled', false, false);
        }
    }
 }
