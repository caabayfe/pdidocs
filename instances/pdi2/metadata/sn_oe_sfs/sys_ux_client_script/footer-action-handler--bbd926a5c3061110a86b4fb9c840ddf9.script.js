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
    const URL_FONT_CREATION_ACTION_HANDLER = 'URL_FONT_CREATION_ACTION_HANDLER';
    const APPLY_BUTTON_ELEMENT_ID = 'apply';
    const {
        elementId
    } = event;
    const {
        urlFontName,
        urlFontAddress
    } = api.state;
    let payload = {
        action: elementId
    };

    if (elementId === APPLY_BUTTON_ELEMENT_ID) {
        payload = {
            ...payload,
            fontName: urlFontName,
            fontAddress: urlFontAddress
        };
    }

    api.emit(URL_FONT_CREATION_ACTION_HANDLER, {
        ...payload
    });
}
