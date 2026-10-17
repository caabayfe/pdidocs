/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    var extractItems = function(property) {
        var data = api.data.intent_wise_topic_summary_1;
        return data && data.output && data.output[property] && data.output[property].items;
    };
    const autoSelected = extractItems('AutoSelected');
    const incorrect = extractItems('Incorrect');
    const correct = extractItems('Correct');
    return (!Array.isArray(autoSelected) || !autoSelected.length) && (!Array.isArray(incorrect) || !incorrect.length) && (!Array.isArray(correct) || !correct.length) ? true : false;
}
