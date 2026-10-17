/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {


    // this is a schared operational failed script. Its used my multiple data brokers
    // if addition logic is required for a particular data broker a seperate client scirpt should be created.

    let translatedLabels = api.data.get_translated_labels.output;
    let errorMessage;
    switch (event.elementId) {
    case "deduplication_template_preview":
        errorMessage = translatedLabels.UNABLE_TO_SAVE_PREVIEW_TEMPLATE;
        break;
    case "deduplication_template_create":
        errorMessage = translatedLabels.UNABLE_TO_CREATE_LIBRARY;
        break;
    case "deduplication_template_update":
        errorMessage = translatedLabels.UNABLE_TO_UDPATE_TEMPLATE;
        break;
    case "deduplication_library_create":
        errorMessage = translatedLabels.UNABLE_TO_CREATE_LIBRARY;
        break;
    default:
        errorMessage = translatedLabels.UNKNOWN_ERROR;
    }

    if(api.state.display_preview_timeout > 0)
        helpers.timing.clearTimeout(api.state.display_preview_timeout);


    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'alert1',
            status: 'critical',
            icon: 'info-circle-outline',
            content: errorMessage,
            action: {
                type: 'dismiss'
            }
        }]
    });

}
