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
    const urlPath = event.payload.fieldValue;
    helpers
        .snHttp(`/api/sn_uibtk_api/buildertoolkit/experience/path?path=${urlPath}`, {
            method: "GET"
        })
        .then(({
            response
        }) => {
            // handle GET request response
            api.setState('isUrlInvalid', response.result.inUse);
        })
        .catch(({
            error
        }) => {
            // TODO: Handle errors
        });
}
