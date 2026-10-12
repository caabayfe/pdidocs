/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
	
    let contentBlocks = api.data.ace_fetch_content_blocks.output || [];

    if(api.data.ci_landing_page_data.output.isChatbotInstalled) {
         const { shuffleCtaCards } = imports["sn_oe_sfs.CTACardsUtil"]();
        try {
            contentBlocks = shuffleCtaCards(contentBlocks);
        } catch (e) { }
    }
    api.setState("aceContentBlocks", contentBlocks);

    const { getLazyBlockIds } = imports["sn_ace.ACELazyBlocksUtil"]();
    const _lazyBlockIds = getLazyBlockIds(contentBlocks);
    var toDate = new Date().toISOString().split('T')[0];
    var fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    fromDate = fromDate.toISOString().split('T')[0];
    _lazyBlockIds.forEach(blockId => {
        //helpers.timing.setTimeout(()=>{ },0);
        api.data.lazy_load.execute({
            blockId: blockId,
            pageParams: {
                ...api.state.pageParams,
                startDate: fromDate,
               endDate:toDate

            }
        });
    });
}
