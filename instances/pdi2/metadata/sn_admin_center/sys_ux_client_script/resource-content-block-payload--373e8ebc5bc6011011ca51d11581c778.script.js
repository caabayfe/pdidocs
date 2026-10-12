/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        output
    } = api.data.ace_fetch_content_blocks;
    if (output && output.length) {
        return output[1];
    }

    // return dummy data
    return {
        type: {
            id: '1234'
        }
    };
}
