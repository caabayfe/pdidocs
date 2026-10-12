/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var gFormData;
    try {
        switch (event.name) {
            case 'NOW_CODE_EDITOR#CONTENT_CHANGED':
                gFormData = api.data.gform.nowRecordFormBlob.gForm;
                const updatedSript = event.payload.text;
                gFormData.setValue("script", updatedSript);
                break;
            case 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS':
                api.setState('showAction', !api.state.showAction);
                break;
        }
    } catch (e) {

    }


}
