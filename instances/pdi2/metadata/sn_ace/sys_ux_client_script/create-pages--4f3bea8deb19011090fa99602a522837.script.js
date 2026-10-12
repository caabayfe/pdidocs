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
    const {
        aceAppConfigId,
        loadDemoData
    } = api.state;

    api.data.create_ace_pages.execute({
        loadDemoData: loadDemoData,
        aceAppId: aceAppConfigId
    });

}
