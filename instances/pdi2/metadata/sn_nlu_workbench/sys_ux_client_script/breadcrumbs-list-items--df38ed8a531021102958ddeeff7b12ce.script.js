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
        const res = contentBlocks.find(contentBlock => contentBlock.type.id === "9f3b9c0187410110a4a2c077f6cb0bd3");
        if (res) return res.props_details.breadcrumbs;
    }
}
