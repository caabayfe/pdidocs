/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let message = api.state.summarizedText;
    
    if (!message)
        return;

    function truncateAtWord(str, limit = 169) {
        if (str.length <= limit) return str;

        let truncated = str.slice(0, limit);

        // Find the last space before the cutoff
        let lastSpace = truncated.lastIndexOf(" ");
        if (lastSpace > 0) {
            truncated = truncated.slice(0, lastSpace);
        }

        return truncated + "...";
    }
    return api.state.showMore == true && message.length > 169 ? truncateAtWord(message, 169) : message;
}
