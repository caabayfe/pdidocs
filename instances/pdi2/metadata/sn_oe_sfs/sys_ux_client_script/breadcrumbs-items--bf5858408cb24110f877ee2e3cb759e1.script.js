/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const contentBlocks = api.data.ace_fetch_content_blocks.output;
    if (contentBlocks) {
        var res = contentBlocks
            .filter(function(contentBlock) {
                return contentBlock.name === "Page Header BreadCrumbs";
            });
        if (res.length > 0) return res[0].props_details.breadcrumbs;
    }

}
