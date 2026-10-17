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
    const knowledgeNumber = api.state.knowledge;
    let citationButtons = api.state.citationsList;
    if (knowledgeNumber) {
        const matching = citationButtons.filter(cb => cb.label === knowledgeNumber);
        if (matching.length > 0) {
            citationButtons = matching;
        }
        api.setState('citations', citationButtons);
        api.setState('citationCount', citationButtons.length);
        api.setState('dataFetched', true);
    }
}
