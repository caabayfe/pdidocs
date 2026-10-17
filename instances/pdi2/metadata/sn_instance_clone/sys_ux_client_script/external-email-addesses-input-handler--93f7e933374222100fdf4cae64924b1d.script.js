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
    if (!api.state.disableContinuebutton) {
        api.setState("disableContinuebutton", true);
    }
    if (api.state.showInvalidEmailMessage == 'false' || !api.state.showInvalidEmailMessage) {
        helpers.translate('Multiple emails can be entered seperated by \',\'').then((translatedText) => {
            translatedText = translatedText.replaceAll("\',\'","\' , \'");
            api.setState("showExternalEmailInfoMsg", translatedText);
            api.setState("showExternalEmailInfo", true);
        });
    }
    
}
