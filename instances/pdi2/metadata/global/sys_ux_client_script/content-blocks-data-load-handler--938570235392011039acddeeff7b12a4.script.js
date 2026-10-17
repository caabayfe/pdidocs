/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {

    const contentBlocks = api.data.ace_fetch_content_blocks.output || [];
    api.setState("aceContentBlocks", contentBlocks);
    console.log('Content blocks fetched -> ' + contentBlocks.length);
    const breadCrumbsBlock = contentBlocks.find(cb => cb.type.name === "BreadCrumbs");
    if (breadCrumbsBlock && breadCrumbsBlock.props_details) {
        api.setState("pageBreadcrumbs", breadCrumbsBlock.props_details.breadcrumbs || []);
    }

    const toggleBlock = contentBlocks.find(cb => cb.type.name === "Toggle");
    if (toggleBlock && toggleBlock.props_details) {
        api.setState("iar_enabled", toggleBlock.props_details.status || false);
    }
    const { getLazyBlockIds } = imports["sn_ace.ACELazyBlocksUtil"]();
    const _lazyBlockIds = getLazyBlockIds(contentBlocks);
    _lazyBlockIds.forEach(blockId => {
        //helpers.timing.setTimeout(()=>{ },0);
        api.data.lazy_load.execute({
            blockId: blockId,
            pageParams: api.state.pageParams
        });
    });
}
