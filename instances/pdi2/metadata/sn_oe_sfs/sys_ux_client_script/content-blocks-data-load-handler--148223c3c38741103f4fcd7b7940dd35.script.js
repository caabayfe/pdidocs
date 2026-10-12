/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    let contentBlocks = api.data.ace_fetch_content_blocks.output || [];
    const showParticipantSuggestionsCard = api.data.get_one_extend_definition_config_for_participant_suggestions_service.output;
    // if Participant Suggestions service is not configured, remove the content block from the array to hide it from the page
    if (!showParticipantSuggestionsCard) {
        contentBlocks = contentBlocks.filter((content) => content.block_id !== "bf53e88da38231100bf487c2441e6197");
    }
    api.setState("aceContentBlocks", contentBlocks);
    const breadCrumbsBlock = contentBlocks.find(cb => cb.type.name === "BreadCrumbs");
    if (breadCrumbsBlock && breadCrumbsBlock.props_details) {
        api.setState("pageBreadcrumbs", breadCrumbsBlock.props_details.breadcrumbs || []);
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
