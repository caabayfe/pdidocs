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
    helpers.snHttp('/api/now/documents/permalinkinfo/' + api.context.props.sysId, {
            method: 'GET'
        })
        .then(({
            response
        }) => {
            var data = response.result;
            api.setState("isFetchFailed", false);
            api.setState("isValidLink", data.success); // If the link exists in the DB, returns success true
            api.setState("isLinkExpired", data.isExpired);
            api.setState("fileName", data.file_name);
            api.setState("isInitialized", true); // Setting a flag that data is initialized.
            api.setState("downloadLink", data.download_link); // Storing the downloadable link.
            if (event.name == 'NOW_CONFIRMATION_MESSAGE#PRIMARY_CLICKED')
                api.emit('GET_PERMALINK_INFO_SUCCEEDED', {
                    "onButtonClick": true
                });
            else
                api.emit('GET_PERMALINK_INFO_SUCCEEDED', {});
        })
        .catch(({
            error
        }) => {
            api.setState("isInitialized", true);
            api.setState("isFetchFailed", true);
            api.emit('GET_PERMALINK_INFO_FAILED', {});
        });
}
