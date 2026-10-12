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
    let requestedData = event.payload.data.output;
    let parsedData = JSON.parse(requestedData);
    if (!parsedData.success) {
        let certificateGenErrorState = {};
        certificateGenErrorState.isHidden = false;
        certificateGenErrorState.message = parsedData.error.localizedMessage;
        api.setState('certificateGeneratorErrorState', certificateGenErrorState);
        api.setState('isShowingDownloadKeystoreButton', false);
    }
}
