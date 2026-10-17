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
    try {
        var headerMessage;
        var moreInfo;
        var actionLabel;
        var containsFileName = false;
        if (api.state.isFetchFailed) {
            headerMessage = "Download failed, please try again.";
            moreInfo = "";
            actionLabel = "Download";
        } else if (api.state.isValidLink && !api.state.isLinkExpired) {
            headerMessage = "Document is ready for download.";
            moreInfo = api.state.fileName;
            actionLabel = "Download";
            containsFileName = true;
        } else {
            headerMessage = "The link is invalid.";
            moreInfo = "Please reach out to the owner of the link for support.";
            actionLabel = "";
        }
        api.setState("headerMessage", headerMessage);
        api.setState("moreInfo", moreInfo);
        api.setState("actionLabel", actionLabel);
        if (event.name != 'GET_PERMALINK_INFO_FAILED') {
            var translatedHeader = await helpers.translate(headerMessage);
            var translatedInfo = await helpers.translate(moreInfo);
            var translatedActionLabel = await helpers.translate(actionLabel);
            api.setState("headerMessage", translatedHeader);
            !containsFileName && api.setState("moreInfo", translatedInfo);
            api.setState("actionLabel", translatedActionLabel);
        }
    } catch (error) {
        api.setState("headerMessage", headerMessage);
        api.setState("moreInfo", moreInfo);
        api.setState("actionLabel", actionLabel);
    }
}
