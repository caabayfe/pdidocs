/**
 * Skips first 2 content blocks of Details Content Block and Resources Content Block
 * This repeater handles Content Blocks added after above two
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var otherContentBlocks = api.data.ace_fetch_content_blocks.output ? api.data.ace_fetch_content_blocks.output.slice(2) : [];

    return otherContentBlocks;
}
