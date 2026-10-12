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
        aceAppConfig,
        pageRoute,
        pageParams
    } = api.state;
    var blockContext = api.data.getacepageinitialdata_1.output || {};
    blockContext.pageParams = api.state.pageParams;
    api.setState("aceBlockContext", blockContext);
    api.data.ace_fetch_content_blocks.execute({
        application_id: aceAppConfig,
        page_route: pageRoute,
        page_params: pageParams,
        block_context: blockContext
    });
}
