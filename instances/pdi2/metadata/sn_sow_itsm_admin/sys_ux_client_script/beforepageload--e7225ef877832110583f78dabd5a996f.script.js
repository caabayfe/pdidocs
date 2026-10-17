/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    let blockcontext = api.state.blockcontext;
    //update blockcontext as per your business logic.
    blockcontext.migrateToPARAlertMessage = await helpers.translate("Easily configure charts in view without having to code");
    var viewDocumentationButtonLabel = await helpers.translate("View documentation");
    blockcontext.viewDocumentationCardActions = [{
        "label": viewDocumentationButtonLabel,
        "variant": "secondary",
        "icon": "open-link-fill",
        "tooltipContent": viewDocumentationButtonLabel
    }];
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
}
