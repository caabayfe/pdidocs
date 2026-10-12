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
    let keystoreP12 = event.payload.keystoreP12;
    api.setState('keystoreValue', keystoreP12);
    api.setState('isShowingDownloadKeystoreButton', true);
    api.setState('certificateGenerationMessage', 'Keystore and Truststore successfully generated');
}
